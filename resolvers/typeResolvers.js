const { getJobTypes, sanitizeUser } = require("./helpers");

module.exports = {
	User: {
		company: (user, args, context) => {
			if (user.company !== undefined) {
				return user.company;
			}

			return context.db.user.findUnique({
				where: { id: user.id }
			}).company();
		}
	},
	Company: {
		createdBy: async (company, args, context) => {
			if (company.createdBy !== undefined) {
				return sanitizeUser(company.createdBy);
			}

			const user = await context.db.company.findUnique({
				where: { id: company.id }
			}).createdBy();

			return sanitizeUser(user);
		},
		logo: (company, args, context) => {
			if (company.logo !== undefined) {
				return company.logo;
			}

			return context.db.company.findUnique({
				where: { id: company.id }
			}).logo();
		},
		jobs: (company, args, context) => {
			if (company.jobs !== undefined) {
				return company.jobs;
			}

			return context.db.company.findUnique({
				where: { id: company.id }
			}).jobs({
				orderBy: {
					last_payment: "desc"
				}
			});
		}
	},
	Job: {
		city: (job, args, context) => {
			if (job.city !== undefined) {
				return job.city;
			}

			return context.db.job.findUnique({
				where: { id: job.id }
			}).city();
		},
		company: (job, args, context) => {
			if (job.company !== undefined) {
				return job.company;
			}

			return context.db.job.findUnique({
				where: { id: job.id }
			}).company();
		},
		company_logo: (job, args, context) => {
			if (job.company_logo !== undefined) {
				return job.company_logo;
			}

			return context.db.job.findUnique({
				where: { id: job.id }
			}).company_logo();
		},
		invoices: (job, args, context) => {
			if (job.invoices !== undefined) {
				return job.invoices;
			}

			return context.db.job.findUnique({
				where: { id: job.id }
			}).invoices();
		},
		job_types: (job, args, context) => getJobTypes(context, job)
	},
	Invoice: {
		job: (invoice, args, context) => {
			if (invoice.job !== undefined) {
				return invoice.job;
			}

			return context.db.invoice.findUnique({
				where: { id: invoice.id }
			}).job();
		}
	},
	Country: {
		cities: (country, args, context) => {
			if (country.cities !== undefined) {
				return country.cities;
			}

			return context.db.country.findUnique({
				where: { id: country.id }
			}).cities();
		}
	},
	City: {
		country: (city, args, context) => {
			if (city.country !== undefined) {
				return city.country;
			}

			return context.db.city.findUnique({
				where: { id: city.id }
			}).country();
		},
		jobs: (city, args, context) => {
			if (city.jobs !== undefined) {
				return city.jobs;
			}

			return context.db.city.findUnique({
				where: { id: city.id }
			}).jobs();
		}
	}
};
