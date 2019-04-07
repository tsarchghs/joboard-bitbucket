const { Prisma } = require("prisma-binding");
const graphqlServer = require("graphql-yoga").GraphQLServer;
const resolvers = require("./resolvers");
const prismaTypeDefs = require("./generated/prisma-client/prisma-schema.js").typeDefs;
const jwt = require("jsonwebtoken");
const configs = require("./configs");
const cron = require('node-cron');

const prismaDb = new Prisma({
	typeDefs:prismaTypeDefs,
	endpoint:"https://eu1.prisma.sh/gjergj-kadriu-c6f550/joboard/dev",
	debug: false
})

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

server.start(() => console.log("Running on 4000"));