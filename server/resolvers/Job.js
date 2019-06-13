const permissions = require("./permissions");
const configs = require("../configs");
const stripe = require("stripe")(configs.stripe_secret_key);

const job = async (root,args,context,info) => {
	return await context.db.query.job({where:{id:args.id}},info);
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
		orderBy: args.jobFilter ? args.jobFilter.orderBy : undefined
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
	data["expiresAt"] = today
	if (args.status === "FEATURED"){
		data["expiresAt"] = new Date(today.setDate(today.getDate() + 7));
	}
	try {
		const charge = await stripe.charges.create({
			amount: args.status === "FEATURED" ? 100 * 249 : 100 * 199 ,
		    currency: 'usd',
		    description: args.position,
			source: args.stripe_token,
			customer: context.user ? context.user.id : undefined
		});
		console.log(JSON.stringify(charge))
	} catch (e) {
		throw new Error(`CardError:${e.message}`);
	}
	let job = await context.db.mutation.createJob({
		data
	},`
		{
			id
			company {
				id
				createdBy {
					id
				}
			}
		}
	`)
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