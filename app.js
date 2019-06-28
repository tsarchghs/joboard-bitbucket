const { Prisma } = require("prisma-binding");
const graphqlServer = require("graphql-yoga").GraphQLServer;
const resolvers = require("./resolvers");
const prismaTypeDefs = require("./generated/prisma-client/prisma-schema.js").typeDefs;
const jwt = require("jsonwebtoken");
const configs = require("./configs");
const logger = require("morgan");
const { static } = require("express");
const cron = require('node-cron');
const path = require("path");
const fs = require("fs");

const prismaDb = new Prisma({
	typeDefs:prismaTypeDefs,
	endpoint:"https://eu1.prisma.sh/gjergj-kadriu-c6f550/joboard/dev",
	debug: false
})
const EVERY_MIDNIGHT = "0 0 0 * * *"
const EVERY_MINUTE = "* * * * *"

var daysDifference = (data1, data2) => {
	// time difference
	var timeDiff = Math.abs(data1.getTime() - data2.getTime());
	
	// days difference
	var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
	return diffDays
}

cron.schedule(EVERY_MINUTE, async () => {
	console.log("STARTED")
	let dayInMs = 86400000
	let today = new Date().getTime();
	let yesterday = today - dayInMs;
	let tomorrow = today + dayInMs

	let jobs = await prismaDb.query.jobs({
		where:{status_not:"CLOSED"}
	});
	for (x in jobs){
		let job = jobs[x];
		let job_expiresAt = new Date(job.expiresAt).getTime()
		let new_status = undefined
		let daysDiff = daysDifference(new Date(today), new Date(job_expiresAt));
		if (job_expiresAt < today){
			console.log(today,job_expiresAt,123)
			new_status = "CLOSED"
		} else if (daysDiff < 23 && job.status !== "FEATURED") {
			new_status = "MONTH"
		} else if (daysDiff < 30 && job.status !== "FEATURED") {
			new_status = "WEEK"
		}
		
		console.log(job.id,"---",daysDiff,"---",new_status);
		if (new_status !== undefined && new_status !== job.status){
			prismaDb.mutation.updateJob({
				where:{id: job.id},
				data: {
					status: new_status
				}
			})
		}
	}
});

const server = new graphqlServer({
	typeDefs: "./schema.graphql", 
	resolvers,
	context: async (req) => {
		var user = undefined
		if (req.request.headers["authorization"]){

			const token = req.request.headers["authorization"].split(" ")[1];
			const decoded = await jwt.verify(token,configs.jwt_secret,(err,decoded) => {
				if (err) {
					if (err.name === "JsonWebTokenError") {
						return Error("Invalid token");
					}
					return new Error("Invalid token");
				}
				return decoded
			});
			if (decoded.userId){
				user = await prismaDb.query.user({where:{id:decoded.userId}})
			}
		}
		if (user) user.password = null;
		return {
			req,
			user: user,
			db: prismaDb
		}
	}
});


if (true){
	server.express.use('/assets', static(path.join(__dirname, 'public')))
	server.express.use('/', static(path.join(__dirname, 'build')))
	
	server.express.use((req, res, next) => {
		let protocol = req.get('x-forwarded-proto');
		// console.log(req.secure, req.protocol, protocol);
		if (protocol === "http"){
			// console.log("REDIRECTED");
			// return res.redirect(`https://www.flutterjobs.io${req.url}`)
		}
		next();
	})
	
	server.express.use(static(path.join(__dirname, 'build')));

	server.express.get('/*', async (req, res) => {
		console.log(12323);
		let splitted = req.originalUrl.split("/");
		console.log(splitted);
		let variables = {};
		let job;
		if (splitted[1] === "job"){
			job = await prismaDb.query.job({where:{id:splitted[2]}},`
				{
					id
					company_logo
					position
					description
					company {
						id
						logo {
							id
							url
						}
					}
				}
			`);
			variables["title"] = job.title;
		}
		let filePath = path.resolve(__dirname, 'build', 'index.html');
		fs.readFile(filePath, "utf8",(err,htmlData) => {
			if (err){
				console.log(err);
				return res.status(404).end();
			}
			if (job){
				res.send(
					htmlData.replace("<title>",`<title>${job.position} - Flutterjobs`)
					.replace("</head>",`
							<meta property="og:description" content="${job.description}" />
							<meta property="og:image" content="${job.company ? job.company.logo.url : job.company_website}" />
						  </head>
					`)
				)
			} else {
				res.send(htmlData);
			}
		})
	});
}


server.express.use(logger("dev"));
server.start({
	bodyParserOptions: { limit: "100mb", type: "application/json" }
},() => console.log("Running on 4000"));