
const countries = (root,args,context,info) => {
    return context.db.query.countries({},info);
}

module.exports = {
    countries
}