const permissions = require("./permissions");
const configs = require("../configs");
const stripe = require("stripe")(configs.stripe_secret_key);
const { processUpload } = require("../modules/fileApi");
const { createToken } = require("./authentication");
const bcrypt = require("bcryptjs");
const {
	buildJobWhere,
	createJobTypesWrite,
	replaceJobTypesWrite
} = require("./helpers");

const job = async (root,args,context,info) => {
	return await context.db.job.findUnique({
		where: { id: args.id }
	});
}

const jobs = async (root,args,context,info) => {
	return await context.db.job.findMany({
		where: buildJobWhere(args.jobFilter),
		take: args.jobFilter ? args.jobFilter.first : undefined,
		skip: args.jobFilter ? args.jobFilter.skip : undefined,
		orderBy: {
			last_payment: "desc"
		}
	});
}

const createInvoice = async (context,charge,job_id, featured) => {
	return await context.db.invoice.create({
		data: {
			price: featured ? 249 : 199,
			last_four_digits: Number(charge["source"]["last4"]),
			job: {
				connect: { id: job_id }
			},
			receipt_url: charge["receipt_url"],
			status: "Paid"
		}
	}).catch(console.log)
}

const chargeCard = async (status,position,token) => {
	try {
		const charge = await stripe.charges.create({
			amount: status === "FEATURED" ? 100 * 249 : 100 * 199,
			currency: 'usd',
			description: position,
			source: token
		});
		return charge;
	} catch (e) {
		throw new Error(`CardError:${e.message}`);
	}
}
const createJob = async (root,args,context,info) => {
	if (!args.bp && !args.stripe_token){
		throw new Error("Stripe token not found");
	}
	let data = {
		category: args.category,
		position: args.position,
		location: args.location,
		remote: args.remote,
		min_salary: args.min_salary,
		max_salary: args.max_salary,
		salary_currency: args.salary_currency,
		job_types_rel: createJobTypesWrite(args.job_types),
		status: args.status === "FEATURED" ? args.status : "TODAY",
		apply_url: args.apply_url,
		description: args.description,
		company_name: args.company_name,
		company_email: args.company_email,
		company_website: args.company_website,
		last_payment: new Date()
	}
	if (args.city){
		data["city"] = { connect: { id: args.city }}
	}
	delete data["stripe_token"];
	if (!args.company && !(args.company_name && args.company_email && args.company_website)){
		throw new Error("Must be related to a company");
	}
	if (args.company){
		permissions.loginPermissions(context);
		const company = await context.db.company.findUnique({
			where: { id: args.company }
		});
		if (!company || company.createdById !== context.user.id){
			throw new Error("Unauthorized");
		}
		data["company"] = {connect:{id:args.company}}
	}
	if (args.company_logo){
		var logoFile = await processUpload(args.company_logo, "png", context);
		data["company_logo"] = { connect: { id: logoFile.id }}
	}
	let today = new Date();
	data["expiresAt"] = new Date(today.setDate(today.getDate() + 30));
	let charge;
	if (!args.bp){
		charge = await chargeCard(args.status,args.position,args.stripe_token);
	}
	let job = await context.db.job.create({
		data
	})
	if (!args.bp) {
		await createInvoice(context,charge,job.id, args.status === "FEATURED")
	}
	return job;
}

const createJobAndLogin = async (root,args,context,info) => {
	const user = await context.db.user.findUnique({
		where: { email: args.email },
		include: {
			company: true
		}
	});
	if (!user) {
		throw new Error("Invalid credentials");
	}
	const validPassword = await bcrypt.compare(args.password, user.password);
	if (!validPassword) {
		throw new Error("Invalid credentials");
	}
	let charge = await chargeCard(args.status, args.position, args.stripe_token);
	let today = new Date();
	let data = {
		category: args.category,
		company: { connect: { id: user.company.id } },
		position: args.position,
		location: args.location,
		remote: args.remote,
		min_salary: args.min_salary,
		max_salary: args.max_salary,
		salary_currency: args.salary_currency,
		job_types_rel: createJobTypesWrite(args.job_types),
		description: args.description,
		status: args.status,
		expiresAt: new Date(today.setDate(today.getDate() + 30)),
		apply_url: args.apply_url,
		last_payment: new Date()
	}
	if (args.city){
		data["city"] = { connect: { id: args.city}}
	}
	const job = await context.db.job.create({data})
	await createInvoice(context, charge, job.id, args.status === "FEATURED")
	let auth_data = {
		user: sanitizeUser(user),
		token: createToken(user.id),
		expiresIn: 1
	};
	return {
		auth_data,
		job
	};
}

const renewJob = async (root,args,context,info) => {
	await permissions.loginPermissions(context)
	let job = await context.db.job.findUnique({
		where:{id:args.id}
	})
	let charge;
	try {
		charge = await stripe.charges.create({
			amount: args.featured ? 100 * 249 : 100 * 199,
			currency: 'usd',
			description: job.position,
			source: args.stripe_token
		});
	} catch (e) {
		throw new Error(`CardError:${e.message}`);
	}
	await createInvoice(context, charge,job.id,args.featured)
	let today = new Date();
	return await context.db.job.update({
		where:{
			id: job.id
		},
		data: {
			expiresAt: new Date(today.setDate(today.getDate() + 30)),
			status: args.featured ? "FEATURED" : "TODAY",
			last_payment: new Date()
		}
	})
}

const updateJob = async (root,args,context,info) => {
	console.log("SDADSJAHDASJHKDASJKJK")
	await permissions.loginPermissions(context);
	let where = { id: args.id }
	console.log(context.user)
	if (context.user.role !== "ADMIN"){
		where["company"] = { is: { createdById: context.user.id } }
	}
	let job = await context.db.job.findFirst({where})
	if (!job){
		throw new Error("Job not found");
	}
	console.log(args)
	let data = {
		category: args.category,
		position: args.position,
		description: args.description,
		location: args.location,
		remote: args.remote,
		min_salary: args.min_salary,
		max_salary: args.max_salary,
		salary_currency: args.salary_currency,
		job_types_rel: replaceJobTypesWrite(args.job_types),
		apply_url: args.apply_url
	}
	if (args.city){
		data["city"] = { connect: { id: args.city }}
	}
	return await context.db.job.update({
		where: { id: args.id },
		data
	}) 
}

const deleteJob = async (root,args,context,info) => {
	await permissions.loginPermissions(context);
	let where = { id: args.id }
	if (context.user.role !== "ADMIN"){
		where["company"] = { is: { createdById: context.user.id } }
	}
	let job = await context.db.job.findFirst({where})
	if (!job) {
		throw new Error("Job not found");
	}
	return await context.db.job.delete({
		where: { id: args.id }
	})
}

module.exports = {
	job,
	jobs,
	createJob,
	createJobAndLogin,
	renewJob,
	updateJob,
	deleteJob
}
