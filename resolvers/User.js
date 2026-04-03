const permissions = require("./permissions");
const { sanitizeUser } = require("./helpers");

const getLoggedInUser = async (root,args,context,info) => {
	if (!context.user){
		return null;
	}
	console.log("getLoggedInUser");
	const user = await context.db.user.findUnique({
		where: { id: context.user.id }
	});
	return sanitizeUser(user);
}

module.exports = {
	getLoggedInUser
}
