/**
 * this function allows for an admin user to log in 
 * @param {*} req 
 * @param {*} res 
 * POST
 */
async function adminLogin (req, res) {
    var { username, password, type } = req.body; //|| //JSON.parse(Object.keys(req.body)[0])


    if (username == undefined || password == undefined) {
        username = JSON.parse(Object.keys(req.body)[0]).username;
        password = JSON.parse(Object.keys(req.body)[0]).password;
        type = JSON.parse(Object.keys(req.body)[0]).type;
    }


    if (username == undefined || password == undefined) {
        res.json([
            {
                valid: false,
                message: "you must input peramaters for this to work",
            },
        ]);

        return;
    }

    let bool = await Admin.validate(username, password);

    let del = await Admin.isDeleted(username, "admin");

    if (type == "json") {
        if (bool) {
            res.json([
                {
                    valid: true,
                    message: "you have logged in",
                },
            ]);
        } else {
            //if( bool && ! )
            if (del) {
                res.json([
                    {
                        valid: false,
                        message: "this account has been removed",
                    },
                ]);
            } else {
                res.json([
                    {
                        valid: false,
                        message: "this account does not exist",
                    },
                ]);
            }
        }
    } else {
        
        if (bool) {
            var array = await getUserInfo()
            
            req.session.username = username;
            req.session.loged_in = true;
            req.session.type = "admin"
            let dat = {
                images: allIcons,
                items: array,
                username: req.session.username,
            }

        
            res.status(200).render("adminPage", dat);

            res.end()
    
        } else {
            //if( bool && ! )
            if (del) {
                req.session.loged_in = false;
                res.status(404).render("homePage", {
                    error: {
                        message: "this account has been removed",
                    },
                    username: req.session.username,
                    loged_in: req.session.loged_in,
                });
            } else {
                req.session.loged_in = false;
                res.status(401).render("homePage", {
                    error: {
                        message: "this account does not exist or the password was incorect",
                    },
                    username: req.session.username,
                    loged_in: req.session.loged_in,
                });
            }
        }

    }
}

/**
 * allsows admin users to give basic users a first name
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
async function applyFname(req, res) {
    var { username, fname, type } = req.body; //|| JSON.parse(Object.keys(req.body)[0])

    if (username == undefined || fname == undefined || type == undefined) {
        username = JSON.parse(Object.keys(req.body)[0]).username;
        fname = JSON.parse(Object.keys(req.body)[0]).fname;
    }

    if (username == undefined || fname == undefined) {
        res.json([
            {
                valid: false,
                username: "you must input peramaters for this to work",
            },
        ]);

        return;
    }

    let bool = await Basic.account(username);

    if (bool) {
        let x = await Admin.name(username, fname, false, type);

        if (!x) {
            res.json([
                {
                    valid: false,
                    message: `something went wrong with the account ${username}`,
                },
            ]);
        } else {
            let all = await Admin.getAll();

            res.json([
                {
                    valid: true,
                    message: `the account ${username} now has the name ${fname} applyed to it.`,
                },
            ]);
        }
    } else {
        res.json([
            {
                valid: false,
                message: `that username is invalid`,
            },
        ]);
    }
}

/**
 * allsows admin users to give basic users a last name
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
async function applyLname(req, res) {
    var { username, lname, type } = req.body; //|| JSON.parse(Object.keys(req.body)[0])

    if (username == undefined || lname == undefined || type == undefined) {
        username = JSON.parse(Object.keys(req.body)[0]).username;
        lname = JSON.parse(Object.keys(req.body)[0]).lname;
        type = JSON.parse(Object.keys(req.body)[0]).type;
    }

    if (username == undefined || lname == undefined) {
        res.json([
            {
                valid: false,
                username: "you must input peramaters for this to work",
            },
        ]);

        return;
    }

    let bool = await Basic.account(username);

    if (bool) {
        let x = await Admin.name(username, false, lname, type);

        if (!x) {
            res.json([
                {
                    valid: false,
                    message: `something went wrong with the account ${username}`,
                },
            ]);
        } else {
            let all = await Admin.getAll();

            res.json([
                {
                    valid: true,
                    message: `the account ${username} now has the last name ${lname} applyed to it.`,
                },
            ]);
        }
    } else {
        res.json([
            {
                valid: false,
                message: `that username is invalid`,
            },
        ]);
    }
}

/**
 * this function for admin users allows them to change the username of a basic user
 * @param {*} req 
 * @param {*} res 
 * @returns {unknown}
 */
async function admin_changeUsername (req, res) {
    var { username, new_username } = req.body; //|| JSON.parse(Object.keys(req.body)[0])

    if (username == undefined || new_username == undefined) {
        username = JSON.parse(Object.keys(req.body)[0]).username;
        new_username = JSON.parse(Object.keys(req.body)[0]).new_username;
    }

    if (username == undefined || new_username == undefined) {
        res.json([
            {
                valid: false,
                username: "you must input peramaters for this to work",
            },
        ]);

        return;
    }

    let bool = await Basic.account(username);

    if (bool) {
        let x = await Admin.update_username(username, new_username);

        if (!x) {
            res.json([
                {
                    valid: false,
                    message: `something went wrong with the account ${username}`,
                },
            ]);
        } else {
            res.json([
                {
                    valid: true,
                    message: `the account ${username} now has the username of ${new_username} `,
                },
            ]);
        }
    } else {
        res.json([
            {
                valid: false,
                message: `that username is invalid`,
            },
        ]);
    }
}



async function soft_remove (req, res)  {
    var { your_username, your_password, other_username } =
        req.body || JSON.parse(Object.keys(req.body)[0]);

    if (
        your_username == undefined ||
        your_password == undefined ||
        other_username == undefined
    ) {
        your_username = JSON.parse(Object.keys(req.body)[0]).your_username;
        your_password = JSON.parse(Object.keys(req.body)[0]).your_password;
        other_username = JSON.parse(Object.keys(req.body)[0]).other_username;
    }

    if (
        your_username == undefined ||
        your_password == undefined ||
        other_username == undefined
    ) {
        res.json([
            {
                valid: false,
                message: "you must input peramaters for this to work",
            },
        ]);

        return;
    }

    let del = await Admin.isDeleted(other_username, "basic");

    if (!del) {
        let x = await Admin.soft_remove(
            your_username,
            your_password,
            other_username
        );

        if (!x) {
            res.json([
                {
                    valid: false,
                    message: `something went wrong with the account ${other_username}`,
                },
            ]);
        } else {
            res.json([
                {
                    valid: true,
                    message: "this account has been softly removed",
                },
            ]);
        }
    } else {
        res.json([
            {
                valid: false,
                message: `that username is invalid`,
            },
        ]);
    }
}

async function hard_remove(req, res)  {
    var { your_username, your_password, other_username } =
        req.body || JSON.parse(Object.keys(req.body)[0]);

    if (
        your_username == undefined ||
        your_password == undefined ||
        other_username == undefined
    ) {
        your_username = JSON.parse(Object.keys(req.body)[0]).your_username;
        your_password = JSON.parse(Object.keys(req.body)[0]).your_password;
        other_username = JSON.parse(Object.keys(req.body)[0]).other_username;
    }

    if (
        your_username == undefined ||
        your_password == undefined ||
        other_username == undefined
    ) {
        res.json([
            {
                valid: false,
                message: "you must input peramaters for this to work",
            },
        ]);

        return;
    }

    let x = await Admin.hard_remove(your_username, your_password, other_username);

    if (!x) {
        res.json([
            {
                valid: false,
                message: `something went wrong with the account ${username}`,
            },
        ]);
    } else {
        res.json([
            {
                valid: true,
                message: "this account has been permenitly removed",
            },
        ]);
    }
}

async function restore (req, res) {
    var { your_username, your_password, other_username } =
        req.body || JSON.parse(Object.keys(req.body)[0]);

    if (
        your_username == undefined ||
        your_password == undefined ||
        other_username == undefined
    ) {
        your_username = JSON.parse(Object.keys(req.body)[0]).your_username;
        your_password = JSON.parse(Object.keys(req.body)[0]).your_password;
        other_username = JSON.parse(Object.keys(req.body)[0]).other_username;
    }

    if (
        your_username == undefined ||
        your_password == undefined ||
        other_username == undefined
    ) {
        res.json([
            {
                valid: false,
                username: "you must input peramaters for this to work",
            },
        ]);

        return;
    }

    let del = await Admin.isDeleted(other_username, "basic");

    if (del) {
        let x = await Admin.restore(other_username, your_username, your_password);

        if (!x) {
            res.json([
                {
                    valid: false,
                    message: `something went wrong with the account ${other_username}`,
                },
            ]);
        } else {
            res.json([
                {
                    valid: true,
                    message: "this account has been restored",
                },
            ]);
        }
    } else {
        res.json([
            {
                valid: false,
                message: `this account can not be restored because it has not been deleted`,
            },
        ]);
    }
}

async function coustom_account_create (req, res) {
    var {fname, lname, username, password, account_type, type} = req.body; //|| JSON.parse(Object.keys(req.body)[0])


    if (username == undefined || password == undefined || account_type == undefined) {
        username = JSON.parse(Object.keys(req.body)[0]).username;
        password = JSON.parse(Object.keys(req.body)[0]).password;
        account_type = JSON.parse(Object.keys(req.body)[0]).type;
    }

    if (username == undefined || password == undefined) {
        res.json([
            {
                valid: false,
                message: "you must input peramaters for this to work",
            },
        ]);

        return;
    }

    let allIcons = await Admin.validate(username, password);
    let b = await Basic.validate(username, password);

    let reg = /[a-zA-Z0-9!@#$%^&*]{6,16}$/;

    if( type == 'json'){
    if (!reg.test(password) && account_type == "admin") {
        res.json([
            {
                valid: false,
                message: "the given password dose not match the given values",
            },
        ]);

        return;
    }

    if (!allIcons && !b) {
        let del = await Admin.isDeleted(username, account_type);

        if (del) {
            res.json([
                {
                    valid: false,
                    message: "this account has been removed",
                },
            ]);
        } else {
            let i = await Admin.create(username, password, account_type);
            let s;
            
            if( i !== null ){
             s = await Admin.name(username, fname, lname, account_type);
            }

            res.json([
                {
                    valid: true,
                    message: "this account has been secsesfull created",
                },
            ]);
        }
    } else {
        res.json([
            {
                valid: false,
                message: "this account already exists",
            },
        ]);
    }
}else {
    var array = await getUserInfo()

    

    if (!reg.test(password) && account_type == "admin") {
        res.status(500).redirect("/admin/login")

        return;
    }

    if (!allIcons && !b) {
        let del = await Admin.isDeleted(username, account_type);

        if (del) {
            res.status(406).redirect("/admin/login")
        } else {
            let i = await Admin.create(username, password, account_type);
            let s;
            
            if( i !== null ){
             s = await Admin.name(username, fname, lname, account_type);

             res.status(200).redirect("/admin/login")
            }else{
                res.status(400).redirect("/admin/login")
            }

        
        }
    } else {
        res.status(412).redirect("/admin/login")
    }
}
}

module.exports = {adminLogin, applyFname, applyFname, applyLname, admin_changeUsername, soft_remove, hard_remove, restore, coustom_account_create}