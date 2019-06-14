const permissions = require("./permissions");

const invoices = async (root,args,context,info) => {
    await permissions.loginPermissions(context);
    let user = await context.db.query.user({where:{id:context.user.id}},
        `
        {
            id
            company {
                id
                jobs {
                    id
                    invoices {
                        id
                        last_four_digits
                        status
                        price
                        job {
                            id
                                position
                        }
                        createdAt
                    }
                }
            }
        }
    `)
    console.log(user.company.jobs)
    let invoices = [];
    user.company.jobs.map(job => job.invoices.map(invoice => invoices.push(invoice)))

    console.log(invoices,123) 
    return invoices
}

module.exports = {
    invoices
}