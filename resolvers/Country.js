
const countries = (root,args,context,info) => {
    return context.db.country.findMany();
}

module.exports = {
    countries
}
