

module.exports = {
	loginPermissions: (context) => {
		console.log(context.user,55);
		if (!context.user) {
			throw new Error("Not logged in");
		}
	}
}