const permissions = require("./permissions");
const configs = require("../configs");
const stripe = require("stripe")(configs.stripe_secret_key);


const job = async (root,args,context,info) => {
	return await context.db.query.job({where:{id:args.id}},info);
}

const jobs = async (root,args,context,info) => {
	where = {}
	if (args.jobFilter){
		args.jobFilter.location_contains ? where["location_contains"] = args.jobFilter.location_contains : ""
		args.jobFilter.status_type ? where["status"] = args.jobFilter.status_type : ""
		args.jobFilter.job_type ? where["job_type"] = args.jobFilter.job_type : ""
		args.jobFilter.createdAt_gte ? where["createdAt_gte"] = args.jobFilter.createdAt_gte : ""	
		args.jobFilter.createdAt_lte ? where["createdAt_lte"] = args.jobFilter.createdAt_lte : ""	
	}
	return await context.db.query.jobs({
		where,
		first: args.jobFilter ? args.jobFilter.first : undefined,
		skip: args.jobFilter ? args.jobFilter.skip : undefined

	}
	,info);
}

const createJob = async (root,args,context,info) => {
	let data = {
		...args
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
	let today = new Date();
	data["expiresIn"] = today
	if (args.status === "FEATURED"){
		data["expiresIn"] = new Date(today.setDate(today.getDate() + 7));
	}
	try {
		const charge = await stripe.charges.create({
		    amount: args.status === "FEATURED" ? 9999 * 2 : 9999,
		    currency: 'usd',
		    description: 'Example charge',
		    source: args.stripe_token,
		  });
	} catch (e) {
		throw new Error("CardError");
	}
	let job = await context.db.mutation.createJob({
		data
	},info)
	if (!no_account && job.company.createdBy.id !== context.user.id){
		context.db.mutation.deleteJob({where:{id:job.id}})
		throw new Error("Unauthorized");
	}
	return job;
}

module.exports = {
	job,
	jobs,
	createJob
}