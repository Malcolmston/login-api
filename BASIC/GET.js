/**
 * allows for a user to find there account by username. this function is made for basic users; however, its applications can also be used fro admin users. 
 * @param {*} req 
 * @param {*} res 
 * GET
 */
async function findUser(req, res) {
    let { username } = req.params;

    let bool = await Basic.account(username);

    let del = await Basic.isDeleted(username);

    if (bool) {
        let allIcons = await Basic.getAccount(username);

        let { id, firstName, lastName, email, iconid, type, createdAt, updatedAt } =
            allIcons;

        if (allIcons == null) {
        } else {
            res.status(200).json([
                {
                    valid: true,

                    id: id,
                    firstName: firstName || "",
                    lastName: lastName || "",
                    email: email || "",
                    username: username || "",
                    icon: iconid || 0,
                    type: type || "",
                    createdAt: createdAt.toString() || "",
                    updatedAt: updatedAt.toString() || "",
                },
            ]);
        }
    } else if (del) {
        res.status(400).json([{ valid: false, message: "this account my have been deleted" }])
    } else {
        res.status(400).json([{ valid: false, message: "this account dose not exsist" }])
    }

}

/**
 * this function finds an basic account that has been deleted. this function will not send icons, because once it is deleted showng the icon is no longer important. this fucntion is used in the admin setting, but only has basic user callers 
 * @param {*} req 
 * @param {*} res 
 * GET
 */
async function findDeletedAccount(req, res) {
    let { username } = req.params;

    let bool = await Basic.account(username, true);

    let del = await Basic.isDeleted(username);

    if (bool && del) {
        let allIcons = await Basic.getAccount(username, true);


        let { id, firstName, lastName, email, iconid, type, createdAt, updatedAt } =
            allIcons;

        if (allIcons == null) {
        } else {
            res.status(200).json([
                {
                    valid: true,

                    id: id,
                    firstName: firstName || "",
                    lastName: lastName || "",
                    email: email || "",
                    username: username || "",
                    icon: iconid || 0,
                    type: type || "",
                    createdAt: createdAt.toString() || "",
                    updatedAt: updatedAt.toString() || "",
                },
            ]);
        }
    } else if (!del) {
        res.status(400).json([{ valid: false, message: "this account has not been deleted" }])
    } else {
        res.status(400).json([{ valid: false, message: "this account dose not exsist" }])
    }

}


module.exports = {findUser, findDeletedAccount}