
const company = async (root,args,context,info) => {
	return await context.db.query.company({where:{id:args.id}});
}

module.exports = {
	company
}