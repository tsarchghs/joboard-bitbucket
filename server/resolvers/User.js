const permissions = require("./permissions");

const getLoggedInUser = async (root,args,context,info) => {
	if (!context.user){
		return null;
	}
	console.log("getLoggedInUser");
	return await context.db.query.user({where:{id:context.user.id}},info);
}

module.exports = {
	getLoggedInUser
}