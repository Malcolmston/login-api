/**
 * this function finds admin users by there username 
 * @param {*} req 
 * @param {*} res 
 * GET
 */
async function findAdmin(req, res) {
    let { username } = req.params;

    let bool = await Admin.account(username);

    let del = await Admin.isDeleted(username, "admin");

    if (bool) {
        let all = await Admin.getAll();

        if (all == null) {
        } else {
            let arr = [];
            all.forEach((allIcons, i) => {
                let {
                    id,
                    firstName,
                    lastName,
                    email,
                    username,
                    iconid,
                    type,
                    createdAt,
                    updatedAt,
                    deletedAt,
                } = allIcons;

                arr.push({
                    userId: 1,
                    id: id,
                    valid: true,

                    firstName: firstName == null ? "" : firstName,
                    lastName: lastName == null ? "" : lastName,
                    email: email == null ? "" : email,
                    username: username == null ? "" : username,

                    icon: iconid || "",

                    type: type || "",

                    createdAt: createdAt ? createdAt.toString() : "",
                    updatedAt: updatedAt ? updatedAt.toString() : "",
                    deletetAt: deletedAt ? deletedAt.toString() : "",
                });
            });

            res.json(arr);
        }
    } else if (del) {
    } else {
    }
}



/**
 * this function allows for an admin user to log in, however this uses session as soupposed to user data
 * @param {*} req 
 * @param {*} res 
 * GEt -- POST
 */
async function adminLoginFind (req, res) {

    if( req.session.username && req.session.loged_in && req.session.type == "admin"){
        var array = await getUserInfo()
            
            let dat = {
                images: allIcons,
                items: array,
                username: req.session.username,
            }

        
            res.status(200).render("adminPage", dat);

            res.end()
    
    } else {
        res.status(404).send("you can not go to this page because, you are not logged in")
    }
}

module.exports = {findAdmin, adminLoginFind}