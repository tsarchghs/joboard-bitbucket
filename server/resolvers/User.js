const permissions = require("./permissions");

const getLoggedInUser = async (root,args,context,info) => {
	permissions.loginPermissions(context);
	console.log("getLoggedInUser");
	return await context.db.query.user({where:{id:context.user.id}},info);
}

module.exports = {
	getLoggedInUser
}