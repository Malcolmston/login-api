// npm install sqlite3 bcrypt ejs express express-session sequelize path

const parts = ({
	Basic_Account,
	Admin_Account,
	AppIcons,
} = require("./databace.js"));

const fs = require("fs");

var express = require("express"),
	session = require("express-session"),
	ejs = require("ejs"),
	app = express(),
	sessionMiddleware = session({
		secret: "mysecret",
		resave: true,
		saveUninitialized: true,
	});

app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(sessionMiddleware);

//looks inside the images folder
app.use("/images", express.static("images"));
app.use("/files", express.static("files"));
app.use("/ejsPages", express.static("ejsPages"));


const server = require('http').createServer(app);
const io = require('socket.io')(server);




const Admin = new Admin_Account();
const Basic = new Basic_Account();
const Icons = new AppIcons();


function timeFormat(date) {
	if (typeof date == "object") {
		date = new Date(date)
	}

	return (date.getDay() <= 9 ? "0" + date.getDay() : date.getDay()) + "/" +
		(date.getMonth() <= 9 ? "0" + date.getMonth() : date.getMonth()) + "/" +
		date.getFullYear()
}






(async function () {
	Array.prototype.last = function(){
		return this[this.length-1]
	}

	Array.prototype.isEmpty = function(){
		return this.length == 0
	}

	const posts = [];
	const allIcons = await Icons.getImages;

	async function getUserInfo(){
		var all = await Admin.getAll()
		var array = []
	
		all.forEach(function (item) {
	
			item['icon'] = "";
	
	
	
			item = item.toJSON()
	
			if (item.firstName == "" || item.firstName == null) {
				item.firstName = "none was given"
			}
	
			if (item.lastName == "" || item.lastName == null) {
				item.lastName = "none was given"
			}
	
			if (item.email == "" || item.email == null) {
				item.email = "none was given"
			}
	
	
			if (item.createdAt == item.updatedAt) {
				item.updatedAt = "there have been no updates"
	
				item.createdAt = timeFormat(item.createdAt)
			} else {
				item.createdAt = timeFormat(item.createdAt)
				item.updatedAt = timeFormat(item.updatedAt)
			}
	
			if (item.deletedAt == "" || item.deletedAt == null) {
				item.deletedAt = "none was given"//"this account has not been deleted"
			} else {
				item.deletedAt = timeFormat(item.deletedAt)
			}
	
			array.push(item)
	
	
		})

		for(let item of array){
			let a = await Basic.get_icon( item['username'] )
			item['icon'] = a//.toJSON().file

			if( item['icon'] ){
				item['icon'] =  item['icon'].file.toString() 
			}else{
				item['icon'] = "this account has no icon"
			}
		}
	
	
		array.forEach(async function (item) {
	
			if (item.createdAt == item.updatedAt) {
				item.updatedAt = "there have been no updates"
			}

		})
	
		
		return array
	
	}

	app.get("/", (req, res) => {
		let { username, loged_in, type} = req.session;
		res.render("homePage", {
			error: {
				message: "",
			},
			type: type,
			username: username,
			loged_in: loged_in,
		});
	});

	app.post("/login", async (req, res) => {
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
	});

	app.post("/logout", async (req, res) => {
		req.session.destroy();

		return res.redirect('/')
	})

	app.post("/signup", async (req, res) => {
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
	});

	app.post("/remove", async (req, res) => {
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
	});

	app.post("/renameUsername", async (req, res) => {
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
	});

	app.post("/renamePassword", async (req, res) => {
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
	});


	app.post("/aplyName", async (req, res) => {
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
	});

	app.post("/aplyIcon", async (req, res) => {
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
	});

	//Request URL: http://localhost:3000/user/34/books/8989
	app.get("/user/:username", async (req, res) => {
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

	});

	app.get("/user/deleted/:username", async (req, res) => {
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

	});

	app.get("/user_admin/:username/", async (req, res) => {
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
	});

	app.get("/user_admin_raw/:username/", async (req, res) => {
		let { username } = req.params;

		let bool = await Admin.account(username);

		let del = await Admin.isDeleted(username, "admin");

		if (bool) {
			let all = await Admin.getAll();

			if (all == null) {
			} else {
				var array = []



				all.forEach(function (item) {

					item = item.toJSON()

					delete item['icon'];
					delete item['password'];

					if (item.firstName == "" || item.firstName == null) {
						item.firstName = "none was given"
					}

					if (item.lastName == "" || item.lastName == null) {
						item.lastName = "none was given"
					}

					if (item.email == "" || item.email == null) {
						item.email = "none was given"
					}


					if (item.createdAt == item.updatedAt) {
						item.updatedAt = "there have been no updates"

						item.createdAt = timeFormat(item.createdAt)
					} else {
						item.createdAt = timeFormat(item.createdAt)
						item.updatedAt = timeFormat(item.updatedAt)
					}

					if (item.deletedAt == "" || item.deletedAt == null) {
						item.deletedAt = "none was given"//"this account has not been deleted"
					} else {
						item.deletedAt = timeFormat(item.deletedAt)
					}

					array.push(item)


				})


				array.forEach(function (item) {
					let a = allIcons.filter(x => x.toJSON().id == item.iconId)
					item['icon'] = a.map(x => x.toJSON().file)[0]

					if (item['icon'] == null) {
						delete item["icon"]
					}




					if (item.createdAt == item.updatedAt) {
						item.updatedAt = "there have been no updates"
					}
					delete item['iconId']
				})



				res.json(array);
			}
		} else if (del) {
		} else {
		}
	});


	app.post("/admin/login", async (req, res) => {
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
	});

	app.post("/admin/user/login", async (req, res) => {
		var { username, type } = req.body; //|| //JSON.parse(Object.keys(req.body)[0])


		if (username == undefined) {
			username = JSON.parse(Object.keys(req.body)[0]).username;
			password = JSON.parse(Object.keys(req.body)[0]).password;
			type = JSON.parse(Object.keys(req.body)[0]).type;
		}


		if (username == undefined) {
			res.json([
				{
					valid: false,
					message: "you must input peramaters for this to work",
				},
			]);

			return;
		}

		let bool = await Admin.account(username);

		let del = await Admin.isDeleted(username, "admin");


		if (bool) {
			var all = await Admin.getAll()
			var array = []



			all.forEach(function (item) {

				item['icon'] = "";



				item = item.toJSON()

				if (item.firstName == "" || item.firstName == null) {
					item.firstName = "none was given"
				}

				if (item.lastName == "" || item.lastName == null) {
					item.lastName = "none was given"
				}

				if (item.email == "" || item.email == null) {
					item.email = "none was given"
				}


				if (item.createdAt == item.updatedAt) {
					item.updatedAt = "there have been no updates"

					item.createdAt = timeFormat(item.createdAt)
				} else {
					item.createdAt = timeFormat(item.createdAt)
					item.updatedAt = timeFormat(item.updatedAt)
				}

				if (item.deletedAt == "" || item.deletedAt == null) {
					item.deletedAt = "none was given"//"this account has not been deleted"
				} else {
					item.deletedAt = timeFormat(item.deletedAt)
				}

				array.push(item)


			})


			array.forEach(function (item) {
				let a = allIcons.filter(x => x.toJSON().id == item.iconId)
				item['icon'] = a.map(x => x.toJSON().file)[0]


				if (item.createdAt == item.updatedAt) {
					item.updatedAt = "there have been no updates"
				}
			})



			res.status(200).render("adminPage", {
				images: allIcons,
				items: array,
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


	});

	/*
	app.post("/admin/admin/login", async (req, res) => {
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
					username: "you must input peramaters for this to work",
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
	}else{
		if (bool) {
			var all = await Admin.getAll()
			var array = []
			req.session.username = username;
			req.session.loged_in = true;


			all.forEach(function(item){
				
				item['icon'] = "";
				 


				item = item.toJSON()

				if(item.firstName == "" || item.firstName == null){
					item.firstName = "none was given"
				}

				if(item.lastName == "" || item.lastName == null){
					item.lastName = "none was given"
				}

				if(item.email == "" || item.email == null){
					item.email = "none was given"
				}


				if(item.createdAt == item.updatedAt ){
					item.updatedAt = "there have been no updates"

					item.createdAt = timeFormat( item.createdAt )
				}else{
					item.createdAt = timeFormat( item.createdAt )
					item.updatedAt = timeFormat( item.updatedAt )
				}				
				
				if(item.deletedAt == "" || item.deletedAt == null ){
					item.deletedAt = "none was given"//"this account has not been deleted"
				}else{
					item.deletedAt = timeFormat( item.deletedAt )
				}
				
				array.push( item )

		
			})

			
			array.forEach(function(item){
				let a = allIcons.filter( x => x.toJSON().id == item.iconId  )
				item['icon'] = a.map(x => x.toJSON().file )[0] 


				if(item.createdAt == item.updatedAt ){
					item.updatedAt = "there have been no updates"
				}		
			})

			
			
			res.status(200).render("adminPage", {
				images: allIcons,
				items: array,
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
	});
	*/

	app.post("/admin/fname", async (req, res) => {
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
	});

	app.post("/admin/lname", async (req, res) => {
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
	});

	app.post("/admin/username", async (req, res) => {
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
	});

	app.post("/admin/soft/remove", async (req, res) => {
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
	});

	app.post("/admin/hard/remove", async (req, res) => {
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
	});

	app.post("/admin/restore", async (req, res) => {
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
	});

	app.post("/admin/create", async (req, res) => {
		var { username, password, account_type } = req.body; //|| JSON.parse(Object.keys(req.body)[0])


		if (username == undefined || password == undefined || account_type == undefined) {
			username = JSON.parse(Object.keys(req.body)[0]).username;
			password = JSON.parse(Object.keys(req.body)[0]).password;
			account_type = JSON.parse(Object.keys(req.body)[0]).type;
		}

		console.log( { username, password, account_type } )

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
	});

	io.on('connection', (socket) => {
		socket.on( 'table reload', () => {
			posts.length = 0
		})
		socket.on('send Table', async () => {
			let array = await getUserInfo() 


			if( posts.isEmpty()){
				posts.push( JSON.stringify(array) )
				io.emit( 'send Table',  array);
			}else if( posts.last() == JSON.stringify(array)   ){
				io.emit( 'send Table Error',  "there have been no changes");
				return;
			}else{
				io.emit( 'send Table',  array );
			}

			


			
		});
	  
		
	});
	/*
	app.post("/admin/restore", async (req, res) => {
		var { username, you_username, you_password } = JSON.parse(Object.keys(req.body)[0])
	
	
		if (username == undefined || you_username == undefined || you_password == undefined) {
			res.json([{
				valid: false,
				message: "you must input peramaters for this to work"
			}])
	
			return;
		}
	
		let bool = await Admin.account(you_username)
		let del = await Admin.isDeleted(you_username, "basic")
	
		if (bool) {
			let i = await Admin.restore(username, you_username, you_password)
	
	
			if (!i) {
				res.json([{
					valid: false,
					message: "This account was unable to be restored"
				}])
			} else if (i) {
				res.json([{
					valid: true,
					message: "This account has been successfully restored"
				}])
			} else if (!del) {
				res.json([{
					valid: false,
					message: `the account has not been restored`
	
				}])
			} else {
				res.json([{
					valid: false,
					message: "This account was unable to be restored"
				}])
			}
		}
	
	})
	*/

	server.listen(3000, function() {
		console.log(`Listening on port ${3000}`);
	  });


})()
