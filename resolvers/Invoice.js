const permissions = require("./permissions");

const invoices = async (root,args,context,info) => {
    await permissions.loginPermissions(context);
    return context.db.invoice.findMany({
        where: {
            job: {
                is: {
                    company: {
                        is: {
                            createdById: context.user.id
                        }
                    }
                }
            }
        }
    });
}

module.exports = {
    invoices
}
