const permissions = require("./permissions");
const { processUpload } = require("../modules/fileApi");

const company = async (root,args,context,info) => {
	return await context.db.query.company({where:{id:args.id}});
}

const updateCompany = async (root,args,context,info) => {
	permissions.loginPermissions(context);
	const user = await context.db.query.user({where:{email: args.email}},`{
		id 
		company {
			id
		}
	}`)
	if (user && user.id !== context.user.id){
		throw new Error("Email is taken")
	}
	context.db.mutation.updateUser({
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
	let currentUser = await context.db.query.user({where:{id:context.user.id}},
		`
		{
			id 
			company {
				id
			}
		}
		`);
	let userCompanyId = currentUser.company.id;
	let company = await context.db.mutation.updateCompany({
		where:{
			id: userCompanyId
		},
		data:{
			name: args.name,
			email: args.email,
			website: args.website,
			logo
		}
	},info)
	return company;
}

module.exports = {
	company,
	updateCompany
}
// 1163159
// AprilAprilBerlin#2019