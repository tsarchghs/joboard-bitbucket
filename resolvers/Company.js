const permissions = require("./permissions");
const { processUpload } = require("../modules/fileApi");

const company = async (root,args,context,info) => {
	return await context.db.company.findUnique({
		where: { id: args.id }
	});
}

const updateCompany = async (root,args,context,info) => {
	permissions.loginPermissions(context);
	const user = await context.db.user.findUnique({
		where: { email: args.email }
	});
	if (user && user.id !== context.user.id){
		throw new Error("Email is taken")
	}
	await context.db.user.update({
		where:{
			id: context.user.id
		},
		data:{
			email: args.email
		}
	})
	let logo;
	if (args.logo){
		let logoFile = await processUpload(args.logo, "png", context);
		logo = { connect: { id: logoFile.id }}
	}
	console.log(args,33,args.logo,13,logo,1234);
	let currentCompany = await context.db.company.findUnique({
		where: { createdById: context.user.id }
	});
	if (!currentCompany){
		throw new Error("Company not found");
	}
	let company = await context.db.company.update({
		where:{
			id: currentCompany.id
		},
		data:{
			name: args.name,
			email: args.email,
			website: args.website,
			logo
		}
	})
	return company;
}

module.exports = {
	company,
	updateCompany
}
// 1163159
// AprilAprilBerlin#2019
