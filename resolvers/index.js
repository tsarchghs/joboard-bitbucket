const authResolvers = require("./authentication");
const userResolvers = require("./User");
const companyResolvers = require("./Company"); 
const jobResolvers = require("./Job");
const invoiceResolvers = require("./Invoice")
const countryResolvers = require("./Country");

module.exports = {
	Query: {
		getLoggedInUser: userResolvers.getLoggedInUser,
		company: companyResolvers.company,
		jobs: jobResolvers.jobs,
		job: jobResolvers.job,
		invoices: invoiceResolvers.invoices,
		countries: countryResolvers.countries
	},
	Mutation: {
		login: authResolvers.login,
		register: authResolvers.register,
		updateUser: () => {},
		updateCompany: companyResolvers.updateCompany,
		createJob: jobResolvers.createJob,
		createJobAndLogin: jobResolvers.createJobAndLogin,
		renewJob: jobResolvers.renewJob,
		updateJob: jobResolvers.updateJob,
		deleteJob: jobResolvers.deleteJob
	}
}