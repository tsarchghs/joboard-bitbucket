const permissions = require("./permissions");

const company = async (root,args,context,info) => {
	return await context.db.query.company({where:{id:args.id}});
}

const updateCompany = async (root,args,context,info) => {
	permissions.loginPermissions(context);
	const user = await context.db.query.user({where:{email: args.email}})
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
	await context.db.mutation.updateManyCompanies({
		where:{
			createdBy: {
				id: context.user.id
			}
		},
		data:{
			name: args.name,
			email: args.email,
			website: args.website
		}
	})
	return { success: true }
}

module.exports = {
	company,
	updateCompany
}
// 1163159
// AprilAprilBerlin#2019