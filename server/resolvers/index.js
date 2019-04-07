const authResolvers = require("./authentication");
const userResolvers = require("./User");
const companyResolvers = require("./Company"); 
const jobResolvers = require("./Job");

module.exports = {
	Query: {
		getLoggedInUser: userResolvers.getLoggedInUser,
		company: companyResolvers.company,
		jobs: jobResolvers.jobs,
		job: jobResolvers.job
	},
	Mutation: {
		login: authResolvers.login,
		register: authResolvers.register,
		updateUser: () => {},
		updateCompany: () => {},
		createJob: jobResolvers.createJob,
		updateJob: () => {},
		deleteJob: () => {}
	}
}