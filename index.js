// npm install sqlite3 bcrypt ejs express express-session sequelize path

const {start, login, signup, logout, remove, renameUsername, renamePassword, aplyName, aplyIcon} = require('./BASIC/POST.js')
const {findUser, findDeletedAccount} = require('./BASIC/GET.js')


const  {adminLogin, applyFname, applyFname, applyLname, admin_changeUsername, soft_remove, hard_remove, restore, coustom_account_create} = require('./ADMIN/POST.js')
const {findAdmin, adminLoginFind} = require('./ADMIN/GET.js')


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



(async function () {
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

	app.get("/", start);

	app.post("/login", login);

	app.post("/logout", logout)

	app.post("/signup", signup);

	app.post("/remove", remove);

	app.post("/renameUsername",renameUsername);

	app.post("/renamePassword", renamePassword);


	app.post("/aplyName", aplyName);

	app.post("/aplyIcon",aplyIcon);

	//Request URL: http://localhost:3000/user/34/books/8989
	app.get("/user/:username", findUser);

	app.get("/user/deleted/:username", findDeletedAccount);

	app.get("/user_admin/:username/", findAdmin);

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

	app.get("/admin/login", adminLoginFind)
	

	app.post("/admin/login", adminLogin);

	/*
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
*/
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

	app.post("/admin/fname", applyFname);

	app.post("/admin/lname", applyLname);

	app.post("/admin/username", admin_changeUsername);

	app.post("/admin/soft/remove", soft_remove);

	app.post("/admin/hard/remove", hard_remove);

	app.post("/admin/restore", restore);

	app.post("/admin/create", coustom_account_create);

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

	server.listen(3000, function() {
		console.log(`Listening on port ${3000}`);
	  });


})()
