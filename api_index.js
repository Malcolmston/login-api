// npm install sqlite3 bcrypt ejs express express-session sequelize

/**
 * this handles the innital app loading
 * @param {*} req 
 * @param {*} res 
 */
function start (req, res)  {
	let { username, loged_in, type} = req.session;
		res.render("homePage", {
			error: {
				message: "",
			},
			type: type,
			username: username,
			loged_in: loged_in,
		});
}

/**
 * the log in function allows for basic users to log in to ther account
 * @param {*} req 
 * @param {*} res 
 * @returns {unknown}
 * POST
 */
async function login(req, res) {
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

	let bool = await Basic.validate(username, password);

	let del = await Basic.isDeleted(username);

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
						message: "this account does not exist or the password was incorect",
					},
				]);
			}
		}
	} else {
		if (bool) {
			req.session.username = username;
			req.session.loged_in = true;
			req.session.type = "basic"

			res.status(200).render("home", {
				images: allIcons,
				username: req.session.username,
			});
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
 * this fucntion allows a user to log out
 * @param {*} req 
 * @param {*} res 
 * @returns {unknown}
 * POST
 */
async function logout (req, res) {
	req.session.destroy();

	return res.redirect('/')
}

/**
 * this fucntion allows a user to sign up for a new account
 * @param {*} req 
 * @param {*} res 
 * @returns {unknown}
 * POST
 */
async function signup (req, res) {
	var { username, password, type } = req.body;

	if (username == undefined || password == undefined) {
		username = JSON.parse(Object.keys(req.body)[0]).username;
		password = JSON.parse(Object.keys(req.body)[0]).password;
		type = JSON.parse(Object.keys(req.body)[0]).type;
	}

	if (
		username == undefined ||
		(password == undefined && (username.length > 0 || password.length > 0))
	) {
		res.json([
			{
				valid: false,
				message: "you must input peramaters for this to work",
			},
		]);

		return;
	}

	let bool = await Basic.account(username);
	let del = await Basic.isDeleted(username);

	if (type == "html") {
		if (bool) {
			req.session.username = username;
			req.session.loged_in = true;

			res.status(200).render("home");
		} else if (del) {
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
	} else {
		if (del) {
			res.json([
				{
					valid: false,
					message: "this account has been removed",
				},
			]);
		} else if (bool) {
			res.json([
				{
					valid: false,
					message: "this account already exists or the password was incorect",
				},
			]);
		} else {
			let i = await Basic.create(username, password);

			res.json([
				{
					valid: true,
					message: "this account has been secsesfull created",
				},
			]);
		}
	}
}


/**
 * this function allows a user to remove there account
 * @param {*} req 
 * @param {*} res 
 * @returns {unknown}
 * POST
 */
async function remove(req, res)  {
	var { username, password, type } = req.body; //|| JSON.parse(Object.keys(req.body)[0])

	if (username == undefined || password == undefined) {
		username = JSON.parse(Object.keys(req.body)[0]).username;
		password = JSON.parse(Object.keys(req.body)[0]).password;
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

	let bool = await Basic.account(username);
	let del = await Basic.isDeleted(username);

	if (bool) {
		let i = await Basic.remove(username, password);

		if (!i) {
			res.json([
				{
					valid: true,
					message: "This account was unable to be removed",
				},
			]);
		} else if (i) {
			res.json([
				{
					valid: true,
					message:
						"This account has been successfully removed. You may recover it whenever.",
				},
			]);
		} else if (del) {
			res.json([
				{
					valid: false,
					message: `the account has been deleted`,
				},
			]);
		} else {
			res.json([
				{
					valid: true,
					message: "This account was unable to be removed",
				},
			]);
		}
	} else {
		res.json([
			{
				valid: true,
				message: "This account dose not exsist",
			},
		]);
	}
}

/**
 * this fucnction allows basic usrts to change there username
 * @param {*} req 
 * @param {*} res 
 * @returns {unknown}
 * POST
 */
async function renameUsername(req, res) {
	var { username, new_username, type } = req.body; // || JSON.parse(Object.keys(req.body)[0])

	if (username == undefined || new_username == undefined) {
		username = JSON.parse(Object.keys(req.body)[0]).username;
		new_username = JSON.parse(Object.keys(req.body)[0]).new_username;
		type = JSON.parse(Object.keys(req.body)[0]).type;
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



	let bool = await Basic.account(new_username);

	let del = await Basic.isDeleted(username);

	if (type == "json") {
		if (username.trim() == new_username.trim()) {
			res.json([
				{
					valid: false,
					message: "you can not set your username to your current username",
				},
			]);

			return;
		}

		if (!bool) {
			res.json([
				{
					valid: false,
					message: "an account with that username alredy exists.",
				},
			]);
		} else if (del) {
			res.json([
				{
					valid: false,
					message: "this account has been removed",
				},
			]);
		} else {
			let ans = await Basic.update_username(username, new_username);

			if (!ans) {
				res.json([
					{
						valid: false,
						message: "this account was unable to be changed, try again later",
					},
				]);
			} else {
				res.json([
					{
						valid: true,
						message: `your account was named from ${username} to ${new_username}`,
					},
				]);
			}
		}
	} else {

		if (username.trim() == new_username.trim()) {

			res.sendStatus(400).render("home", {
				images: allIcons,
				username: req.session.username,
			});

			return;
		}

		if (!bool) {
			let x = await Basic.update_username(username, new_username);


			if (x) {
				res.status(200).render("home", {
					images: allIcons,
					username: req.session.username,
				});
			} else {
				res.status(403).render("home", {
					images: allIcons,
					username: req.session.username,
				});
			}
		} else {
			res.status(403).render("home", {
				images: allIcons,
				username: req.session.username,
			});
		}

	}
}

/**
 * this function allows for basic users to change their password
 * @param {*} req 
 * @param {*} res 
 * @returns {unknown}
 * POST
 */
async function renamePassword(req, res) {
	var { username, new_password, type } = req.body; // || JSON.parse(Object.keys(req.body)[0])

	if (username == undefined || new_password == undefined) {
		username = JSON.parse(Object.keys(req.body)[0]).username;
		new_password = JSON.parse(Object.keys(req.body)[0]).new_password;
	}

	if (username == undefined || new_password == undefined) {
		res.json([
			{
				valid: false,
				message: "you must input peramaters for this to work",
			},
		]);

		return;
	}

	let bool = await Basic.account(username);

	let del = await Basic.isDeleted(username);

	if (type == "json") {

		if (!bool) {
			let ans = await Basic.update_password(username, new_password);

			if (!ans) {
				res.json([
					{
						valid: false,
						message: "this account was unable to be changed, try again later",
					},
				]);
			} else {
				res.json([
					{
						valid: true,
						message: "your accounts password has been changed",
					},
				]);
			}
		} else if (del) {
			res.json([
				{
					valid: false,
					message: "the account you are trying to rename has been deleted",
				},
			]);
		} else {
			res.json([
				{
					valid: false,
					message: "the account you are trying to rename dose not exist",
				},
			]);
		}

	} else {


		if (!bool) {
			let x = await Basic.update_password(username, new_password);


			if (x) {
				res.status(200).render("home", {
					images: allIcons,
					username: req.session.username,
				});
			} else {
				res.status(403).render("home", {
					images: allIcons,
					username: req.session.username,
				});
			}
		} else {
			res.status(403).render("home", {
				images: allIcons,
				username: req.session.username,
			});
		}

	}
}

/**
 * this function allows for a basic user to add a name to there account
 * @param {*} req 
 * @param {*} res 
 * @returns {unknown}
 * POST
 */
async function aplyName (req, res) {
	var { username, fname, lname, type } = req.body; //|| JSON.parse(Object.keys(req.body)[0])

	if (username == undefined) {
		username = JSON.parse(Object.keys(req.body)[0]).username;
		fname = JSON.parse(Object.keys(req.body)[0]).fname;
		lname = JSON.parse(Object.keys(req.body)[0]).lname;
		type = JSON.parse(Object.keys(req.body)[0]).type;
	}

	if (username == undefined) {
		res.json([
			{
				valid: false,
				username: "you must input peramaters for this to work",
			},
		]);

		return;
	}

	let bool = await Basic.account(username);

	let del = await Basic.isDeleted(username);

	if (type == "json") {
		if (bool) {
			let x = Basic.name(username, fname, lname);

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
						message: `the account ${username} now has the name ${fname} ${lname} applyed to it.`,
					},
				]);
			}
		} else {
			if (del) {
				res.json([
					{
						valid: false,
						message: `the account you are trying to rename has been deleted`,
					},
				]);
			} else if (!bool) {
				res.json([
					{
						valid: false,
						message: `the account you are trying to rename dose not exist`,
					},
				]);
			}
		}
	} else {
		if (bool) {
			let x = Basic.name(username, fname, lname);

			if (!x) {
				res.status(400).render("home", {
					images: allIcons,
					username: req.session.username,
				});
			} else {
				res.status(200).render("home", {
					images: allIcons,
					username: req.session.username,
				});
			}
		} else {
			res.status(400).render("home", {
				images: allIcons,
				username: req.session.username,
			});
		}
	}
}


/**
 * this function allows for a user to apply an icon to there accout via number 
 * @param {*} req 
 * @param {*} res 
 * POST
 */
async function aplyIcon (req, res) {
	var { username, ImageNumber, type } = req.body; //|| JSON.parse(Object.keys(req.body)[0])

	if (username == undefined || ImageNumber == undefined) {
		username = JSON.parse(Object.keys(req.body)[0]).username;
		ImageNumber = JSON.parse(Object.keys(req.body)[0]).ImageNumber;
		type = JSON.parse(Object.keys(req.body)[0]).type;
	}

	if (username == undefined || ImageNumber == undefined) {
		username = Object.keys(req.body)[0].username;
		ImageNumber = Object.keys(req.body)[0].ImageNumber;
	}

	let bool = await Basic.account(username);

	let del = await Basic.isDeleted(username);

	if (type == "json") {
		if (bool) {
			let x = await Basic.icon(username, ImageNumber || null);
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
						message: `the account ${username} now has an icon.`,
					},
				]);
			}
		} else {
			if (del) {
				res.json([
					{
						valid: false,
						message: `the account you are trying to rename has been deleted`,
					},
				]);
			} else {
				res.json([
					{
						valid: false,
						message: `the account you are trying to rename dose not exist`,
					},
				]);
			}
		}
	} else {
		if (bool) {
			let x = await Basic.icon(username, Number(ImageNumber) + 1);

			if (x) {
				res.status(200).render("home", {
					images: allIcons,
					username: req.session.username,
				});
			} else {
				res.sendStatus(403).render("home", {
					images: allIcons,
					username: req.session.username,
				});
			}
		} else {
			res.sendStatus(403).render("home", {
				images: allIcons,
				username: req.session.username,
			});
		}
	}
}


