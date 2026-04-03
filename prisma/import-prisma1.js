const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "..", ".env") });

const prisma = require("./client");

const LEGACY_ENDPOINT = process.env.PRISMA_ENDPOINT;
const BATCH_SIZE = 100;

if (!LEGACY_ENDPOINT) {
	throw new Error("PRISMA_ENDPOINT must be set to the legacy Prisma 1 GraphQL endpoint.");
}

const parseDate = (value) => value ? new Date(value) : undefined;

const legacyQuery = async (query, variables = {}) => {
	const response = await fetch(LEGACY_ENDPOINT, {
		method: "POST",
		headers: {
			"Content-Type": "application/json"
		},
		body: JSON.stringify({ query, variables })
	});

	if (!response.ok) {
		throw new Error(`Legacy Prisma request failed with ${response.status} ${response.statusText}`);
	}

	const payload = await response.json();

	if (payload.errors && payload.errors.length) {
		throw new Error(payload.errors.map((error) => error.message).join("\n"));
	}

	return payload.data;
};

const fetchAll = async (resource, fields) => {
	const results = [];
	let skip = 0;

	while (true) {
		const query = `
			query FetchBatch($first: Int!, $skip: Int!) {
				${resource}(first: $first, skip: $skip) {
					${fields}
				}
			}
		`;
		const data = await legacyQuery(query, { first: BATCH_SIZE, skip });
		const batch = data[resource];

		if (!batch.length) {
			break;
		}

		results.push(...batch);
		skip += batch.length;

		if (batch.length < BATCH_SIZE) {
			break;
		}
	}

	return results;
};

const upsertFiles = async (files) => {
	for (const file of files) {
		await prisma.file.upsert({
			where: { id: file.id },
			update: {
				filename: file.filename,
				mimetype: file.mimetype,
				encoding: file.encoding,
				url: file.url,
				createdAt: parseDate(file.createdAt),
				updatedAt: parseDate(file.updatedAt)
			},
			create: {
				id: file.id,
				filename: file.filename,
				mimetype: file.mimetype,
				encoding: file.encoding,
				url: file.url,
				createdAt: parseDate(file.createdAt),
				updatedAt: parseDate(file.updatedAt)
			}
		});
	}
};

const upsertUsers = async (users) => {
	for (const user of users) {
		await prisma.user.upsert({
			where: { id: user.id },
			update: {
				email: user.email,
				password: user.password,
				role: user.role,
				createdAt: parseDate(user.createdAt),
				updatedAt: parseDate(user.updatedAt)
			},
			create: {
				id: user.id,
				email: user.email,
				password: user.password,
				role: user.role,
				createdAt: parseDate(user.createdAt),
				updatedAt: parseDate(user.updatedAt)
			}
		});
	}
};

const upsertCountries = async (countries) => {
	for (const country of countries) {
		await prisma.country.upsert({
			where: { id: country.id },
			update: {
				name: country.name,
				createdAt: parseDate(country.createdAt),
				updatedAt: parseDate(country.updatedAt)
			},
			create: {
				id: country.id,
				name: country.name,
				createdAt: parseDate(country.createdAt),
				updatedAt: parseDate(country.updatedAt)
			}
		});
	}
};

const upsertCities = async (cities) => {
	for (const city of cities) {
		await prisma.city.upsert({
			where: { id: city.id },
			update: {
				name: city.name,
				country: {
					connect: { id: city.country.id }
				},
				createdAt: parseDate(city.createdAt),
				updatedAt: parseDate(city.updatedAt)
			},
			create: {
				id: city.id,
				name: city.name,
				country: {
					connect: { id: city.country.id }
				},
				createdAt: parseDate(city.createdAt),
				updatedAt: parseDate(city.updatedAt)
			}
		});
	}
};

const upsertCompanies = async (companies) => {
	for (const company of companies) {
		const baseData = {
			email: company.email,
			name: company.name,
			website: company.website,
			createdBy: {
				connect: { id: company.createdBy.id }
			},
			createdAt: parseDate(company.createdAt),
			updatedAt: parseDate(company.updatedAt)
		};

		const updateData = {
			...baseData,
			logo: company.logo
				? { connect: { id: company.logo.id } }
				: { disconnect: true }
		};

		const createData = {
			id: company.id,
			...baseData
		};

		if (company.logo) {
			createData.logo = { connect: { id: company.logo.id } };
		}

		await prisma.company.upsert({
			where: { id: company.id },
			update: updateData,
			create: createData
		});
	}
};

const upsertJobs = async (jobs) => {
	for (const job of jobs) {
		const baseData = {
			category: job.category,
			position: job.position,
			location: job.location,
			remote: job.remote,
			salary_currency: job.salary_currency,
			min_salary: job.min_salary,
			max_salary: job.max_salary,
			description: job.description,
			status: job.status,
			apply_url: job.apply_url,
			last_payment: parseDate(job.last_payment),
			company_name: job.company_name,
			company_email: job.company_email,
			company_website: job.company_website,
			expiresAt: parseDate(job.expiresAt),
			createdAt: parseDate(job.createdAt),
			updatedAt: parseDate(job.updatedAt)
		};

		const updateData = {
			...baseData,
			job_types_rel: {
				deleteMany: {},
				create: (job.job_types || []).map((type) => ({ type }))
			},
			city: job.city
				? { connect: { id: job.city.id } }
				: { disconnect: true },
			company: job.company
				? { connect: { id: job.company.id } }
				: { disconnect: true },
			company_logo: job.company_logo
				? { connect: { id: job.company_logo.id } }
				: { disconnect: true }
		};

		const createData = {
			id: job.id,
			...baseData,
			job_types_rel: {
				create: (job.job_types || []).map((type) => ({ type }))
			}
		};

		if (job.city) {
			createData.city = { connect: { id: job.city.id } };
		}

		if (job.company) {
			createData.company = { connect: { id: job.company.id } };
		}

		if (job.company_logo) {
			createData.company_logo = { connect: { id: job.company_logo.id } };
		}

		await prisma.job.upsert({
			where: { id: job.id },
			update: updateData,
			create: createData
		});
	}
};

const upsertInvoices = async (invoices) => {
	for (const invoice of invoices) {
		const baseData = {
			last_four_digits: invoice.last_four_digits,
			price: invoice.price,
			status: invoice.status,
			receipt_url: invoice.receipt_url,
			createdAt: parseDate(invoice.createdAt),
			updatedAt: parseDate(invoice.updatedAt)
		};

		const updateData = {
			...baseData,
			job: invoice.job
				? { connect: { id: invoice.job.id } }
				: { disconnect: true }
		};

		const createData = {
			id: invoice.id,
			...baseData
		};

		if (invoice.job) {
			createData.job = { connect: { id: invoice.job.id } };
		}

		await prisma.invoice.upsert({
			where: { id: invoice.id },
			update: updateData,
			create: createData
		});
	}
};

const main = async () => {
	console.log(`Importing legacy data from ${LEGACY_ENDPOINT}`);

	const [
		files,
		users,
		countries,
		cities,
		companies,
		jobs,
		invoices
	] = await Promise.all([
		fetchAll("files", `
			id
			filename
			mimetype
			encoding
			url
			createdAt
			updatedAt
		`),
		fetchAll("users", `
			id
			email
			password
			role
			createdAt
			updatedAt
		`),
		fetchAll("countries", `
			id
			name
			createdAt
			updatedAt
		`),
		fetchAll("cities", `
			id
			name
			createdAt
			updatedAt
			country {
				id
			}
		`),
		fetchAll("companies", `
			id
			email
			name
			website
			createdAt
			updatedAt
			createdBy {
				id
			}
			logo {
				id
			}
		`),
		fetchAll("jobs", `
			id
			category
			position
			location
			remote
			city {
				id
			}
			salary_currency
			min_salary
			max_salary
			description
			job_types
			status
			apply_url
			last_payment
			company {
				id
			}
			company_logo {
				id
			}
			company_name
			company_email
			company_website
			expiresAt
			createdAt
			updatedAt
		`),
		fetchAll("invoices", `
			id
			last_four_digits
			price
			status
			receipt_url
			createdAt
			updatedAt
			job {
				id
			}
		`)
	]);

	console.log(JSON.stringify({
		files: files.length,
		users: users.length,
		countries: countries.length,
		cities: cities.length,
		companies: companies.length,
		jobs: jobs.length,
		invoices: invoices.length
	}, null, 2));

	await upsertFiles(files);
	await upsertUsers(users);
	await upsertCountries(countries);
	await upsertCities(cities);
	await upsertCompanies(companies);
	await upsertJobs(jobs);
	await upsertInvoices(invoices);

	console.log("Legacy import complete.");
};

main()
	.catch((error) => {
		console.error(error);
		process.exitCode = 1;
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
