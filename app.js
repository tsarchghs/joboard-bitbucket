const { Prisma } = require("prisma-binding");
const graphqlServer = require("graphql-yoga").GraphQLServer;
const resolvers = require("./resolvers");
const prismaTypeDefs = require("./generated/prisma-client/prisma-schema.js").typeDefs;
const jwt = require("jsonwebtoken");
const configs = require("./configs");
const logger = require("morgan");
var cron = require('node-cron');
const { static } = require("express");
const path = require("path");

const prismaDb = new Prisma({
	typeDefs:prismaTypeDefs,
	endpoint:"https://eu1.prisma.sh/gjergj-kadriu-c6f550/joboard/dev",
	debug: false
})
const EVERY_MIDNIGHT = "0 0 0 * * *"
const EVERY_MINUTE = "* * * * *"

var daysDifference = (data1, data2) => {
	console.log(data1, 223, data2)
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
		if (job_expiresAt < today){
			console.log(today,job_expiresAt,123)
			new_status = "CLOSED"
		} else if (daysDifference(new Date(today), new Date(job_expiresAt)) < 6){
			console.log(tomorrow, 123, job_expiresAt, 11, daysDifference(new Date(tomorrow), new Date(job_expiresAt)))
				new_status = "OLD"
		}
		console.log(new_status,12)
		if (new_status !== undefined && new_status !== job.status){
			if (!(new_status === "OLD" && job.status === "FEATURED")){
				console.log(new_status, 55)
				prismaDb.mutation.updateJob({
					where:{id: job.id},
					data: {
						status: new_status
					}
				})
			}
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

server.express.use('/static', static(path.join(__dirname, 'public')))
server.express.use(static(path.join(__dirname, 'build')));

server.express.use(logger("dev"));
server.start({
	bodyParserOptions: { limit: "100mb", type: "application/json" }
},() => console.log("Running on 4000"));