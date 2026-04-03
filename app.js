const graphqlServer = require("graphql-yoga").GraphQLServer;
const resolvers = require("./resolvers");
const jwt = require("jsonwebtoken");
const configs = require("./configs");
const logger = require("morgan");
const { static } = require("express");
const cron = require('node-cron');
const path = require("path");
const fs = require("fs");
const htmlToText = require('html-to-text');
const compression = require('compression');

require('dotenv').config()

const prismaDb = require("./prisma/client");
const { sanitizeUser } = require("./resolvers/helpers");

var daysDifference = (data1, data2) => {
	// time difference
	var timeDiff = Math.abs(data1.getTime() - data2.getTime());
	
	// days difference
	var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
	return diffDays
}

cron.schedule("0 */30 * * * *", async () => {
	console.log("STARTED")
	let dayInMs = 86400000
	let today = new Date().getTime();
	let jobs = await prismaDb.job.findMany({
		where:{status:{not:"CLOSED"}}
	});
	for (const job of jobs){
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
			await prismaDb.job.update({
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
			try {
				const decoded = jwt.verify(token,configs.jwt_secret);
				if (decoded.userId){
					user = await prismaDb.user.findUnique({
						where: { id: decoded.userId }
					})
				}
			} catch (error) {
				user = undefined;
			}
		}
		return {
			req,
			user: sanitizeUser(user),
			db: prismaDb
		}
	}
});


if (process.env.production === "true"){
	server.express.use(logger("dev"));
	server.express.use(compression());

	server.express.use((req, res, next) => {
		let protocol = req.get('x-forwarded-proto');
		if (process.env.REDIRECT_TO_HTTPS && protocol !== "https"){
			console.log("REDIRECT");
			return res.redirect(`${process.env.REDIRECT_TO_HTTPS}${req.url}`)
		}
		next();
	})

	server.express.use('/assets', static(path.join(__dirname, 'public')))
	server.express.use(static(path.join(__dirname, 'client/build'), { index: false}));
	// server.express.use("/",static(path.join(__dirname, 'client/build')))
	
	server.express.get('*', async (req, res) => {
		console.log(req.body)
		let splitted = req.originalUrl.split("/");
		let job;
		if (splitted[1] === "job"){
			job = await prismaDb.job.findUnique({
				where:{id:splitted[2]},
				include: {
					company_logo: true,
					company: {
						include: {
							logo: true
						}
					}
				}
			});
			
		}

		let filePath = path.resolve(__dirname, 'client/build', 'index.html');
		fs.readFile(filePath, "utf8",(err,htmlData) => {
			if (err){
				console.log(err);
				return res.status(404).end();
			}
			console.log(process.env.USE_LOCATION,55)
			let PUBLIC_DATA = {
				logo_url: process.env.LOGO_URL,
				domain: process.env.DOMAIN,
				head_title: process.env.HEAD_TITLE,
				website_name: process.env.WEBSITE_NAME,
				find_only_text: process.env.FIND_ONLY_TEXT,
				below_find_only_html: process.env.BELOW_FIND_ONLY_HTML,
				twitter: process.env.TWITTER,
				email: process.env.EMAIL,
				favicon_path: process.env.FAVICON_PATH,
				domain_svg: process.env.DOMAIN_SVG,
				apollo_client_uri: process.env.APOLLO_CLIENT_URI,
				above_job_position_text: process.env.ABOVE_JOB_POSITION_TEXT,
				use_predefined_location: process.env.USE_PREDEFINED_LOCATION,
				use_keywords: process.env.USE_KEYWORDS,
				use_location: process.env.USE_LOCATION,
				use_categories: process.env.USE_CATEGORIES,
				default_city: process.env.DEFAULT_CITY,
				default_predefined_location: process.env.default_predefined_location,
				production_client: process.env.production_client
			}
			htmlData = htmlData.replace("</head>",`
				<link rel="stylesheet" href="${process.env.EXTRA_CSS_PATH}">
				<script>
					window.__PUBLIC_DATA__=${JSON.stringify(PUBLIC_DATA)}
				</script>
				<link rel="shortcut icon" href="${PUBLIC_DATA.favicon_path}"/>
				</head>	
			`)
			if (job){
				let logo;
				if (job.company && job.company.logo && job.company.logo.url){
					logo = job.company.logo.url.replace("https","http");
				} else if (job.company_logo && job.company_logo.url){
					logo = job.company_logo.url.replace("https","http");
				}
				return res.send(
					htmlData.replace("<title>",`<title>${job.position} - Flutterjobs`)
					.replace("</head>",`
					<meta property="og:description" content="${htmlToText.fromString(job.description)}">
					${!logo ? ""
					: `<meta property="og:image" content="${logo}">`
				}
				</head>
				`)
				)
			} else {
				return res.send(htmlData.replace("<title>", `<title>${PUBLIC_DATA.head_title}`));
			}
		})
		
	});
}

var privateKey  = fs.readFileSync('sslcert/server.key', 'utf8');
var certificate = fs.readFileSync('sslcert/server.crt', 'utf8');	

server.start({
	port: 4001,
  https: {
    key: privateKey,
    cert: certificate
  },


	bodyParserOptions: { limit: "100mb", type: "application/json" }
},() => console.log("Running on 4001"));
