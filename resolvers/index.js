const authResolvers = require("./authentication");
const userResolvers = require("./User");
const companyResolvers = require("./Company"); 
const jobResolvers = require("./Job");
const invoiceResolvers = require("./Invoice")

module.exports = {
	Query: {
		getLoggedInUser: userResolvers.getLoggedInUser,
		company: companyResolvers.company,
		jobs: jobResolvers.jobs,
		job: jobResolvers.job,
		invoices: invoiceResolvers.invoices
	},
	Mutation: {
		login: authResolvers.login,
		register: authResolvers.register,
		updateUser: () => {},
		updateCompany: companyResolvers.updateCompany,
		createJob: jobResolvers.createJob,
		renewJob: jobResolvers.renewJob,
		updateJob: jobResolvers.updateJob,
		deleteJob: jobResolvers.deleteJob
	}
}