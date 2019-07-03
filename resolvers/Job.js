const permissions = require("./permissions");
const configs = require("../configs");
const stripe = require("stripe")(configs.stripe_secret_key);
const { processUpload } = require("../modules/fileApi");
const { createToken } = require("./authentication");
const bcrypt = require("bcrypt");

const saltRounds = 10;

const job = async (root,args,context,info) => {
	return await context.db.query.job({ where: { id: args.id } },info);
}

const jobs = async (root,args,context,info) => {
	where = {}
	if (args.jobFilter){
		args.jobFilter.location_contains ? where["location_contains"] = args.jobFilter.location_contains :  null
		args.jobFilter.status_type ? where["status"] = args.jobFilter.status_type :  null
		args.jobFilter.job_type ? where["job_type"] = args.jobFilter.job_type :  null
		args.jobFilter.createdAt_gte ? where["createdAt_gte"] = args.jobFilter.createdAt_gte :  null	
		args.jobFilter.createdAt_lte ? where["createdAt_lte"] = args.jobFilter.createdAt_lte :  null
		args.jobFilter.id_not_in ? where["id_not_in"] = args.jobFilter.id_not_in :  null
		args.jobFilter.status_not_in ? where["status_not_in"] = args.jobFilter.status_not_in : null
	}
	return await context.db.query.jobs({
		where,
		first: args.jobFilter ? args.jobFilter.first : undefined,
		skip: args.jobFilter ? args.jobFilter.skip : undefined,
		orderBy: "last_payment_DESC"
	}
	,info);
}

const createInvoice = async (context,charge,job_id, featured) => {
	return await context.db.mutation.createInvoice({
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
		charge = await stripe.charges.create({
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
		position: args.position,
		location: args.location,
		salary: args.salary,
		job_type: args.job_type,
		status: args.status === "FEATURED" ? args.status : "TODAY",
		apply_url: args.apply_url,
		description: args.description,
		company_name: args.company_name,
		company_email: args.company_email,
		company_website: args.company_website,
		last_payment: new Date()
	}
	
	delete data["stripe_token"];
	if (!args.company && !(args.company_name && args.company_email && args.company_website)){
		throw new Error("Must be related to a company");
	}
	let no_account = false;
	if (args.company_name && args.company_email && args.company_website){
		no_account = true;
	}
	if (args.company){
		permissions.loginPermissions(context);
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
	let job = await context.db.mutation.createJob({
		data
	},`
		{	
			id
			location
			position
			status
			job_type
			expiresAt
			company {
				id
				createdBy {
					id
				}
			}
		}
	`)
	if (!args.bp) {
		createInvoice(context,charge,job.id, args.status === "FEATURED")
	}
	if (!no_account && job.company.createdBy.id !== context.user.id){
		context.db.mutation.deleteJob({where:{id:job.id}})
		throw new Error("Unauthorized");
	}
	return job;
}

const createJobAndLogin = async (root,args,context,info) => {
	const user = await context.db.query.user({ where: { email: args.email } },
		`
			{
				id
				password
				company {
					id
				}
			}
		`);
	if (!user) {
		throw new Error("Invalid credentials");
	}
	const validPassword = await bcrypt.compare(args.password, user.password);
	if (!validPassword) {
		throw new Error("Invalid credentials");
	}
	let charge = await chargeCard(args.status, args.position, args.stripe_token);
	let today = new Date();
	const job = await context.db.mutation.createJob({
		data:{
			company: { connect: { id: user.company.id }},
			position: args.position,
			location: args.location,
			salary: args.salary,
			job_type: args.job_type,
			description: args.description,
			status: args.status,
			expiresAt: new Date(today.setDate(today.getDate() + 30)),
			apply_url: args.apply_url,
			last_payment: new Date()
		}
	})
	createInvoice(context, charge, job.id, args.status === "FEATURED")
	let auth_data = {
		user,
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
	let job = await context.db.query.job({where:{id:args.id}})
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
	createInvoice(context, charge,job.id,args.featured)
	let today = new Date();
	await context.db.mutation.updateJob({
		where:{
			id: job.id
		},
		data: {
			expiresAt: new Date(today.setDate(today.getDate() + 30)),
			status: args.featured ? "FEATURED" : "TODAY",
			last_payment: new Date()
		}
	},info)
	return job;
}

const updateJob = async (root,args,context,info) => {
	await permissions.loginPermissions(context);
	let job = await context.db.query.jobs({
		where: {id: args.id, company: {createdBy: { id: context.user.id }}}
	},info)
	job = job[0];
	if (!job){
		throw new Error("Job not found");
	}
	return await context.db.mutation.updateJob({
		where: { id: args.id },
		data: {
			position: args.position,
			description: args.description,
			location: args.location,
			salary: args.salary,
			job_type: args.job_type,
			apply_url: args.apply_url
		}
	},info) 
}

const deleteJob = async (root,args,context,info) => {
	await permissions.loginPermissions(context);
	let job = await context.db.query.jobs({
		where: { id: args.id, company: { createdBy: { id: context.user.id } } }
	}, info)
	job = job[0];
	if (!job) {
		throw new Error("Job not found");
	}
	return await context.db.mutation.deleteJob({
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