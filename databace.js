
   //https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map
const groupBy = (items, key) => items.reduce(
    (result, item) => ({
      ...result,
      [item[key]]: [
        ...(result[item[key]] || []),
        item,
      ],
    }), 
    {},
);

/**
 * 
 * @param {*} inputArr 
 * @returns 
 * @see https://stackoverflow.com/questions/9960908/permutations-in-javascript
 */
const permutator = (inputArr) => {
    let result = [];
  
    const permute = (arr, m = []) => {
      if (arr.length === 0) {
        result.push(m)
      } else {
        for (let i = 0; i < arr.length; i++) {
          let curr = arr.slice();
          let next = curr.splice(i, 1);
          permute(curr.slice(), m.concat(next))
       }
     }
   }
  
   permute(inputArr)
  
   return result;
  }

Array.prototype.arrSim = function (arr) {
    let array1 = this
    let array2 = arr 
    //return permutator(array1).filter( x =>  x.every( (currentValue, index) => currentValue == arr[index] ) )

    return this.every( (currentValue, index) => currentValue == arr[index] )
}

Array.prototype.arrSim2 = function (arr) {
    return !(permutator(this).filter( x => x.arrSim(arr) )).isEmpty()
}

Array.prototype.isEmpty = function () {
    return this.length === 0
}


async function covert({UserId, roomId}, db = Users){
    let user = await db.findByPk(UserId, {raw: true})
    let room = await Rooms.findByPk(roomId, {raw: true})

    return {user: user.username, room: room.room}


   }


const bcrypt = require("bcrypt");
const crypto = require("crypto");
const path = require("path");
const fs = require("fs");

const sqlite3 = require("sqlite3");
const { Sequelize, DataTypes, Op, QueryTypes, where, Model } = require("sequelize");
const { use } = require("bcrypt/promises");



const db = new sqlite3.Database("uses.sqlite");
//https://github.com/sequelize/sequelize/issues/10304
const sequelize = new Sequelize("uses", "", "", {
	dialect: "sqlite",
	storage: "uses.sqlite",
	benchmark: true,
	standardConformingStrings: true,
	logging: false,
});

const queryInterface = sequelize.getQueryInterface();


const Icons = sequelize.define("icons", {
	id: {
		type: Sequelize.INTEGER,
		autoIncrement: true,
		primaryKey: true,
	},

	icon: {
		type: DataTypes.TEXT,
		allowNull: false,
		unique: true,
	},

	path: {
		type: DataTypes.INTEGER,
		allowNull: false,
		unique: true,
	},

	file: {
		type: DataTypes.BLOB,
		allowNull: true,
		unique: false,
	},
});

const Users = sequelize.define("Users",
	{
		id: {
			type: Sequelize.INTEGER,
			autoIncrement: true,
			primaryKey: true,
		},

		firstName: {
			type: DataTypes.TEXT,
			allowNull: true,
			unique: false,
		},

		lastName: {
			type: DataTypes.TEXT,
			allowNull: true,
			unique: false,
		},

		email: {
			type: DataTypes.TEXT,
			allowNull: true,
			unique: false,
		},

		username: {
			type: DataTypes.TEXT,
			allowNull: false,
			unique: true,
		},

		password: {
			type: DataTypes.TEXT,
			allowNull: false,
			unique: false,
		},

		type: {
			type: DataTypes.TEXT,
			allowNull: false,
			unique: false,
		},
	},
	{
		timestamps: true,

	deletedAt: "deletedAt",
	paranoid: true,
})


Icons.hasMany(Users);
Users.belongsTo(Icons);

Users.sync();

class Account {
	constructor() {}
	getFileBuffer(fullPath) {
		let filepath = path.resolve(__dirname, fullPath);
		let profilePicture = Buffer.from(fs.readFileSync(filepath));

		return profilePicture;
	}

	allInfolder(folder = "images") {
		let directoryPath = path.join(__dirname, folder);

		return new Promise((resolve, reject) => {
			fs.readdir(directoryPath, function (err, files) {
				//handling error
				if (err) {
					reject(err);
				}
				resolve(files);
			});
		});
	}

	Account(username, type, Database) {
		return new Promise(async function (resolve) {
			let res = await Users.findOne({
				where: {
					username: username,
					type: type, //"basic"
				},
			});
	}

	Del_Account(username, type, Database) {
		return new Promise(async function (resolve) {
			let res = await Database.findOne({
				where: {
					username: username,
					type: type, //"basic"
				},
				paranoid: false,
			} );

			resolve(res);
		});
	}

	get Name() {
		//https://stackoverflow.com/questions/9719570/generate-random-password-string-with-requirements-in-javascript
		return new Array(10)
			.fill("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz")
			.map((x) =>
				(function (chars) {
					let umax = Math.pow(2, 32),
						r = new Uint32Array(1),
						max = umax - (umax % chars.length);
					do {
						crypto.getRandomValues(r);
					} while (r[0] > max);
					return chars[r[0] % chars.length];
				})(x)
			)
			.join("");
	}

	password_hide(text) {
		return new Promise(function (resolve, reject) {
			bcrypt.genSalt(10, function (err, salt) {
				bcrypt.hash(text, salt, function (err, hash) {
					if (err) return reject(err);

					// Store hash in your password DB.
					resolve(hash);
				});
			});
		});
	}

	password_simi(password, hash) {
		return new Promise((resolve, reject) => {
			bcrypt.compare(password, hash, function (err, result) {
				resolve(result);
			});
		});
	}

	generateId (len) {
		return crypto.randomBytes(len).toString('hex');
	  }
}


class AppIcons extends Account {
	constructor() {
		super();
	}

	async exsist(image) {
		let a = await Icons.findOne({
			where: { icon: image },
		});

		return a !== null;
	}

	/**
	 * this function will eiter retiver or create the given image file
	 *  @param {String} image this usese a complex string of a file in the images folder
	 * @returns {promises} return a sequelize object of the file that is chosen or created
	 */
	async addFile(image) {
		let profilePicture = this.getFileBuffer(`images/${image}.svg`);

		const [user, created] = await Icons.findOrCreate({
			where: {
				icon: image,
				path: `images/${image}.svg`,
			},
		});

		if (created) {
			user.file = profilePicture;

			await user.save();
		}
		return user;
	}

	async addBolck(...images) {
		let arr = [];

		let r = this;
		arr = images.map(async (x, index) => {
			let profilePicture = r.getFileBuffer(`images/${x}`);

			if (!(await r.exsist((index + 1).toString()))) {
				return {
					icon: (index + 1).toString(),
					path: `images/${index + 1}.svg`,
					file: profilePicture,
				};
			} else {
				return false;
			}
		});

		arr = (await Promise.all(arr)).filter((x) => x);

		let res = await Icons.bulkCreate(arr);

		return res;
	}

	async addAll() {
		let all = await this.allInfolder();

		return await this.addBolck(...all);
	}

	 get getImages() {
		return Icons.findAll();
	}
}

class Basic_Account extends Account {
	constructor() {
		super();
	}

	/**
	 * this function will get if an account is deleted
	 * @param {String} username is the users username
	 * @returns {promises} true if the account is deleted otherwise it will return true
	 */
	async isDeleted(username) {
		let pf = await Users.findOne({
			where: {
				username: username,
				type: "basic",
			},
			paranoid: true,
		});

		let pt = await Users.findOne({
			where: {
				username: username,
				type: "basic",
			},
			paranoid: false,
		});

		if (pf) {
			return false;
		}

		if (!pf && pt) {
			return true;
		} else {
			return false;
		}
	}

	/**
	 * gets weter or not a users username and password are valid
	 * @param {String} username is the users username
	 * @param {String} password is the users password
	 * @returns {promises} returns true if the username and password are the same as the corresponding users username and password.
	 */
	async validate(username, password) {
		let pwd = await this.password_hide(password);

		let del = await this.isDeleted(username);

		if (del) {
			return false;
		}

		let res = await this.Account(username, "basic");
		if( res === null) return false;

		let a = await this.password_simi(password, res.password);


		if (a) {
				return true;
		} else {
			return false;
		}
	}

	/**
	 *  sees if an account with a username exists.
	 * @param {String} username is the users username
	 * @returns {promises} returns true if the account exists, otherwise it returns false
	 */
	async account(username, type = "basic", del=false) {
		let res;
		
		if( !del ){
		res = await Users.findOne({
			where: {
				username: username,
				type,
			},
		});
	}else {
		res = await Users.findOne({
			where: {
				username: username,
				type,
			},
			paranoid: false
		});
	}

		if (res == null) {
			return false;
		} else {
			return true;
		}
	}

	/**
	 * allows a user to specify there first name and then last name in the database.
	 * @param {String} username is the users username
	 * @param {String} fname is the users first name
	 * @param {String} lname is the users last name
	 * @returns {promises}
	 */
	async name(username, fname, lname) {
		let bool = await this.Account(username, "basic");

		if (bool === null) return false;

		bool.set({
			firstName: fname,
			lastName: lname,
		});

		return await bool.save();
	}
	/**
	 * allows a user to create a icon image for there account.
	 * @param {String} username is the users username
	 * @param {String} url is the url of a img that you want as the cantact image for a user
	 * @returns {promises}
	 */
	async icon(username, id) {
		let bool = await this.Account(username, "basic");

		if (bool === null) return false;

		let img = await Icons.findByPk(id);

		return await img.addUsers([bool]);
	}

	async get_icon(username) {
		let bool = await this.Account(username, "basic", this.Database);

		if (bool === null) return false;

		let img = await Icons.findByPk(bool.iconId);

		if (img === null) return false;

		return img.toJSON()
	}

	async create(username, password) {
		let bool = await this.account(username);

		if (bool) return;

		let p = await this.password_hide(password);

		let a = await Users.create({
			username: username,
			password: p,
			type: "basic",
		});

		return a;
	}

	async remove(username, password) {
		let d = await this.validate(username, password);

		if (d) {
			let r = await Users.destroy({
				where: { username: username, type: "basic" },
			});

			return r;
		} else {
			return false;
		}
	}

	async update_username(username, c) {
		let bool = await this.account(c);

		if (bool) return false;

		let d = await Users.update(
			{ username: c },
			{
				where: { username: username, type: "basic" },
			}
		);

		return d;
	}

	async update_password(username, c) {
		let e = await this.password_hide(c.toString());

		let d = await Users.update(
			{ password: e },
			{
				where: { username: username, type: "basic" },
			}
		);

		return d;
	}

	async getAccount(username, type = "basic", del=false) {
		let res;
		
		if( !del ){
		res = await this.Database.findOne({
			where: {
				username: username,
				type,
			},
		});
	}else {
		res = await this.Database.findOne({
			where: {
				username: username,
				type,
			},
			paranoid: false
		});
	}

		if (res == null) {
			return false;
		} else {
			return res.toJSON();
		}
	}
}

class Admin_Account extends Account {
	constructor() {
		super();
	}

	/**
	 * this function will get if an account is deleted
	 * @param {String} username is the users username
	 * @returns {promises} true if the account is deleted otherwise it will return true
	 */
	async isDeleted(username, type = "admin") {
		let pf = await Users.findOne({
			where: {
				username: username,
				type: type,
			},
			paranoid: true,
		});

		let pt = await Users.findOne({
			where: {
				username: username,
				type: type,
			},
			paranoid: false,
		});

		if (pf) {
			return false;
		}

		if (!pf && pt) {
			return true;
		} else {
			return false;
		}
	}

	async validate(username, password) {
		let del = await this.isDeleted(username);

		if (del) {
			return false;
		}

		let res = await this.Account(username, "admin", this.Database );

		

		if(res === null) return false
		let a = await this.password_simi(password, res.password);

		if (a) {
			if (res == null) {
				return false;
			} else {
				return true;
			}
		} else {
			return false;
		}
	}

	async account(username) {
		let res = await Users.findOne({
			where: {
				username: username,
				type: "admin",
			},
		});

		if (res == null) {
			return false;
		} else {
			return true;
		}
	}

	/**
	 * allows a user to specify there first name and then last name in the database.
	 * @param {String} username is the users username
	 * @param {String} fname is the users first name
	 * @param {String} lname is the users last name
	 * @returns {promises} or false if no parermeters are given
	 */
	async name(username, fname = false, lname = false, type = "admin") {
		let bool = await this.Account(username, type, this.Database);

		if (bool === null) return false;

		if (fname && lname) {
			bool.set({
				firstName: fname,
				lastName: lname,
			});
		} else if (fname) {
			bool.set({
				firstName: fname,
			});
		} else if (lname) {
			bool.set({
				lastName: lname,
			});
		} else {
			return false;
		}


		let a = await bool.save();

		return a;
	}
	/**
	 * allows a user to create a icon image for there account.
	 * @param {String} username is the users username
	 * @param {String} url is the url of a img that you want as the cantact image for a user
	 * @returns {promises}
	 */
	async icon(username, id) {
		let bool = await this.Account(username, "admin", this.Database);

		if (bool === null) return false;

		const img = await Icons.findByPk(id);

		return await bool.setIcon(img);
	}
	//https://sequelize.org/docs/v6/core-concepts/assocs/#foohasonebar
	async get_icon(username) {
		let bool = await this.Account(username, "admin", this.Database );

		if (bool === null) return false;

		return await bool.getIcon();
	}

	async apply_icon(username, type) {
		let bool = await this.Account(username, type, this.Database );

		if (bool === null) return false;

		const img = await Icons.findByPk(id);
	
		return await img.addUsers([bool]);
	}

		/**
	 * this function will allow admin users to create new Icons
	 * @param {String} username username of the account of thr Admin user
	 * @param {String} password password of the account of thr Admin user
	 * @param {String} image this usese a complex string of a file in the images folder
	 * @returns {promises} return a sequelize object of the file that is chosen or created. if the given username and password are invalid then it will return false
	 */
		async addIcon(username, password, image) {
			let tv = await this.validate(username, password)

			if(tv){
			let profilePicture = this.getFileBuffer(`images/${image}.svg`);
	
			const [user, created] = await Icons.findOrCreate({
				where: {
					icon: image,
					path: `images/${image}.svg`,
				},
			});
	
			if (created) {
				user.file = profilePicture;
	
				await user.save();
			}

			return user;
		}else{
			return false
		}
		}

	// checks the Basic table
	async check(username, password) {
		let pwd = await this.password_hide(password);

		let a = await this.password_simi(password, pwd);

		if (a) {
			let res = await Users.findOne({
				where: {
					username: username,
					type: "admin",
				},
			});

			if (res == null) {
				return false;
			} else {
				return true;
			}
		} else {
			return false;
		}
	}

	// checks the Basic table by the username and user type
	async findBy(username, type) {
		let res = await Users.findOne({
			where: {
				username: username,
				type: type,
			},
		});

		if (res == null) {
			return false;
		} else {
			return true;
		}
	}

	async create(username, password, type) {
		let bool = await this.account(username);

		if (bool) return;

		let p = await this.password_hide(password);
		let reg = /[a-zA-Z0-9(\W|_)]{6,20}$/;

		if (reg.test(password) || type == "basic") {
			let a = await Users.create({
				username: username,
				password: p,
				type: type,
			});

			return a;
		} else {
			return false;
		}
	}

	async soft_remove(username, password, Busername) {
		let a = this.account(Busername);
		if (a) {
			let i = await this.check(username, password);

			if (i) {
				let r = await Users.destroy({ where: { username: Busername } });

				return r;
			} else {
				return false;
			}
		} else {
			return false;
		}
	}

	async hard_remove(username, password, Busername) {
		let a = this.account(Busername); //this.validate(Busername, Bpassword)
		if (a) {
			let i = await this.check(username, password);

			if (i) {
				let r = await Users.destroy({
					where: { username: Busername },
					force: true,
				});

				return r;
			} else {
				return false;
			}
		} else {
			return false;
		}
	}

	async restore(username, Yusername, Ypassword) {
		let c1 = await this.findBy(username, "basic");
		let c2 = await this.validate(Yusername, Ypassword);

		if (!c1 && c2) {
			let r = await Users.restore({
				where: {
					username: username,
				},
			});

			return true;
		} else {
			return false;
		}
	}

	async update_username(username, c) {
		let d = await Users.update(
			{ username: c },
			{
				where: { username: username },
			}
		);

		return d;
	}

	async update_password(username, c) {
		let e = await this.password_hide(c.toString());

		let d = await Users.update(
			{ password: e },
			{
				where: { username: username },
			}
		);

		return d;
	}

	async getAll() {
		let all = await this.Database.findAll({ paranoid: false });

		return all;
	}
}




class Bsiness_Account extends Account {
		constructor(name) {
			super()
		this.name = name
	}


	async add_member(type, username, pwd, firstName, lastName, email){
		let password = await this.password_hide(pwd);

		let a = await Buisness.create({ 
			name: this.name ,type, username, password, firstName, lastName, email
		})
		let b = await Users.create({ type: "buisness"});

		await a.addUsers([b])

	}

	async get_users(type) {
		return (await Buisness.findAll({ where: {
			type: {
				[Op.is]: type
			}

		 } })).map(x => x.toJSON());
	}

	
}



class Room extends Account {
	constructor(){
		super()
	}

	async  getGroupbyName(name){
		return await Rooms.findOne({where: {name}, raw: true})
	  }	  
  
	async getUser(username, databace = Users) {
		if(!databace) databace = Users
	  let type = await this.getAccountType(username, databace)
	  let p = await this.Account(username, type, databace)
  
	  return p.toJSON()
	}
	/**
   * this function gets a room by the room code. 
   * @param {String} code should be a string that is the room code you are looking for
   * @returns {Sequelize} returns an object that is an repesentation of the found SQL in JSON format. 
   */
  async get_RoombyCode( code ){
	return (await Rooms.findOne({where: {room: code}}))
  }
  
  async validate_RoombyCode( code ){
	return (await Rooms.findOne({where: {room: code}})) == undefined
  }
  
  async  getRoombyUser(...users){
	let p = users.map( async user => await Users.findOne({
	  where:{username:user.username},
	  include: [{
		model: Rooms,
		/*
		where: {
		  name: {
			[Op.is]: null
		  }
		},
		*/
		raw: true
	  }],
	})
	)
	//p = await Promise.all ((await Promise.all(p)).map(async user => await covert({UserId: user['rooms.User_Room.UserId'], roomId: user['rooms.User_Room.roomId'] }) ))
	//p = groupBy(p, "room")
	
	p = await Promise.all((await Promise.all(p)).map( x => x.toJSON().rooms ).flat().map( async x => await covert(x.User_Room) ))
	p = Object.entries(groupBy(p, "room"))
	p = p.map( x => x[1] )
	p = p.filter( x => users.map(x => x.username).arrSim2(x.map(x => x.user  ))  ).flat()
	
	var user_arr = p.flatMap(x => x.user )
	var room = [...new Set(p.flatMap(x => x.room ))][0]
	
	return {users: user_arr, room}  
	}

	async  getRoomby_Buissness_User(...users){
		let userArr = users.map( async user => await Buisness.findOne({
			where:{
				username: user.username,
			},
			raw: true
		}))
		let userIds = (await Promise.all(userArr) )

		let p = userIds.map( async user => await Users.findOne({
		  where:{
			id: user.id,
			type: 'buisness'
		},
		  include: [{
			model: Rooms,
			/*
			where: {
			  name: {
				[Op.is]: null
			  }
			},
			*/
			raw: true
		  }],
		})
		)
		//p = await Promise.all ((await Promise.all(p)).map(async user => await covert({UserId: user['rooms.User_Room.UserId'], roomId: user['rooms.User_Room.roomId'] }) ))
		//p = groupBy(p, "room")
		


		p = await Promise.all((await Promise.all(p)).map( x => x.toJSON().rooms ).flat().map( async x => await covert(x.User_Room, Buisness) ))
		p = Object.entries(groupBy(p, "room"))
		p = p.map( x => x[1] )
		p = p.filter( x => users.map(x => x.username).arrSim2(x.map(x => x.user  ))  ).flat()
		
		var user_arr = p.flatMap(x => x.user )
		var room = [...new Set(p.flatMap(x => x.room ))][0]
		
		return {users: user_arr, room}  
		}

  
  async createRoom(...args) {
	
	let name, show_name = null;
  if( args.length > 2 ){
	show_name = this.generateId(15)
	name = args.map(x => x.username).join()
  }
  if( (await this.getRoombyUser(...args)).room !== undefined ) return;
  
	  let r = this.generateId(10)
  		let t = await Rooms.create({
		  room:r,
		 "show-name": show_name,
		  name
	 })  
	  
	
		  let a = this
		 args.forEach(async function(user){
		  let rt = await a.getUser(user.username, false) 



		  await t.addUser(rt.id)
		})
  
	
		
		 return r
   }
  
   async create_Business_Room(...args) {
	
	let name, show_name = null;

	if( args.length > 2 ){
		show_name = this.generateId(15)
		name = args.map(x => x.username).join()
	  }

if( (await this.getRoomby_Buissness_User(...args)).room !== undefined ) return;
  
	  let r = this.generateId(13)
  		let t = await Rooms.create({
		  room:r,
		 "show-name": show_name,
		  name
	 })  
	  
	
		  let a = this
		 args.forEach(async function(user){
		  let rt = await a.getUser(user.username, Buisness) 



		  await t.addUser(rt.id)
		})
  
	
		
		 return r
   }



   async getGroupbyMembers(...users) {
	let p = users.map( async user => await Users.findOne({
	  where:{username:user.username},
	  include: [{
		model: Rooms,
		where: {
		  name: {
			[Op.ne]: null
		  }
		},
		raw: true
	  }],
	}) )
	//p = await Promise.all ((await Promise.all(p)).map(async user => await covert({UserId: user['rooms.User_Room.UserId'], roomId: user['rooms.User_Room.roomId'] }) ))
	//p = groupBy(p, "room")
	p = await Promise.all((await Promise.all(p)).map( x => x.toJSON().rooms ).flat().map( async x => await covert(x.User_Room) ))
	p = Object.entries(groupBy(p, "room"))
	p = p.map( x => x[1] )
	p = p.filter( x => users.map(x => x.username).arrSim2(x.map(x => x.user  ))  ).flat()
	
	var user_arr = p.flatMap(x => x.user )
	var room = [...new Set(p.flatMap(x => x.room ))][0]
	
	return {users: user_arr, room}  
  }
  
  async getGroups(){
	return await Rooms.findAll({where: {
	  name:{
	  [Op.ne]: null
	  }
	}})
  }
  
  }
  
class Message_Controller extends Room {
	constructor() {
		super()
	}
  
	async  messageResponce(messageId){
	  let a = await Message.findByPk(messageId, {
		raw: true
	  })
	
	  if( a === null ) return;
	
	
	
	   let reply = (await Message.findOne({
		where:{
		id: a.link,
	  }, 
	  raw: true
	}))
	
	   let c = await Message.findAll({
		where: {
		  link: a.link,
		  userId: a.UserId
		},
		raw: true
	  })
	
	
	return {
	  responses: c.map(a => a.message),
	  message: reply.message,
	}
	//{sent: b.message, message: a.message}
	
	return {sent: b, message: a.message}//{sent, message:  a.message}
	
	}
	
	async  getRoomsandChats(user){
	  let pos = 0
	  let arr = (await Users.findAll({
		where: {username: user},
		include: [{
		  model: Rooms,
		  where: {
			name: {
			[Op.is]: null
			}
		  },
		  raw: true
		}],
	  }
	  )).map( x => x.toJSON())
	
	  
	  arr = (await Promise.all( 
		arr.map( async x => (await Promise.all(x.rooms.map( async x => (await covert(x.User_Room)) ) ))
	  ))).flat().filter( x => x.user == user ).map(x => x.room )
	  
	  arr = [...new Set(arr)]
	
	  let all = (await Message.findAll({
		attributes: { 
		  exclude: ['UserId', "roomId", "deletedAt", "updatedAt"]
		},
		include: [{
		  model: Rooms,
		  raw: true,
		  where: {
			room: {[Op.or]: arr }
		  }
		}, {
		  model: Users,
		  raw: true
		}],
		raw: true
	  })).map( async x =>{ 
		if( pos == x.link && x.link != null ){
		  pos = 0;
		  return;
		}
		if(x.link != null){ pos =  x.link}
	
		let t =  {
		  id: x.id, 
		  name:  x['User.username'], 
		  message: (x.link != null ?  await messageResponce(x.id) : x.message), 
		  room: x['room.room'], 
		  time: x['room.createdAt'], 
		  place: x['User.username'] == user ? "right" : "left",
		  link: x.link
		} 
	
	
		return t
		})
	
	return (await Promise.all(all)).filter(x => x != undefined )
	}

	async  get_Buissness_Rooms_Chats(user){

		let pos = 0

		let id = (await Buisness.findOne({
			where:{
				username: user,
			},
			raw: true
		})).id


		let arr = (await Users.findAll({
		  where: {id},
		  include: [{
			model: Rooms,
			where: {
			  name: {
			  [Op.is]: null
			  }
			},
			raw: true
		  }],
		}
		))
		
		arr = arr.map( x => x.toJSON())
	  
		
		arr = (await Promise.all( 
		  arr.map( async x => (await Promise.all(x.rooms.map( async x => (await covert(x.User_Room, Buisness)) ) ))
		))).flat().filter( x => x.user == user ).map(x => x.room )
		
		arr = [...new Set(arr)]
	  
				


		let all = (await Message.findAll({
		  attributes: { 
			exclude: ['UserId', "roomId", "deletedAt", "updatedAt"]
		  },
		  include: [{
			model: Rooms,
			raw: true,
			where: {
			  room: {[Op.or]: arr }
			}
		  }, {
			model: Users,
			raw: true
		  }],
		  raw: true
		}))

		if( all.length === 0) return [];
		
		all = all.map( async x =>{ 
		  if( pos == x.link && x.link != null ){
			pos = 0;
			return;
		  }
		  if(x.link != null){ pos =  x.link}
	  
		  let t =  {
			id: x.id, 
			name:  x['User.username'], 
			message: (x.link != null ?  await this.messageResponce(x.id) : x.message), 
			room: x['room.room'], 
			time: x['room.createdAt'], 
			place: x['User.username'] == user ? "right" : "left",
			link: x.link
		  } 
	  
	  
		  return t
		  })
	  
	  return (await Promise.all(all)).filter(x => x != undefined )
	  }

	
	async getGroupandChats(user) {
	  let pos = 0
	  let arr = (await Users.findAll({
		where: {username: user},
		include: [{
		  model: Rooms,
		  where: {
			name: {
			[Op.ne]: null
			}
		  },
		  raw: true
		}],
	  }
	  )).map( x => x.toJSON())
	
	  
	  arr = (await Promise.all( 
		arr.map( async x => (await Promise.all(x.rooms.map( async x => (await covert(x.User_Room)) ) ))
	  ))).flat().filter( x => x.user == user ).map(x => x.room )
	  
	  arr = [...new Set(arr)]
	
	  let all = (await Message.findAll({
		attributes: { 
		  exclude: ['UserId', "roomId", "deletedAt", "updatedAt"]
		},
		include: [{
		  model: Rooms,
		  raw: true,
		  where: {
			room: {[Op.or]: arr }
		  }
		}, {
		  model: Users,
		  raw: true
		}],
		raw: true
	  })).map( async x =>{ 
		if( pos == x.link && x.link != null ){
		  pos = 0;
		  return;
		}
		if(x.link != null){ pos =  x.link}
	
		let t =  {
		  id: x.id, 
		  name:  x['User.username'], 
		  message: (x.link != null ?  await messageResponce(x.id) : x.message), 
		  room: x['room.room'], 
		  time: x['room.createdAt'], 
		  place: x['User.username'] == user ? "right" : "left",
		  link: x.link
		} 
	
	
		return t
		})
	
	return (await Promise.all(all)).filter(x => x != undefined )
	}

	async get_Buissness_Groups_Chats(user){
		let pos = 0

		let id = (await Buisness.findOne({
			where:{
				username: user,
			},
			raw: true
		})).id



		let arr = (await Users.findAll({
		  where: {id},
		  include: [{
			model: Rooms,
			where: {
			  name: {
			  [Op.ne]: null
			  }
			},
			raw: true
		  }],
		}
		)).map( x => x.toJSON())
	  
		
		arr = (await Promise.all( 
		  arr.map( async x => (await Promise.all(x.rooms.map( async x => (await covert(x.User_Room)) ) ))
		))).flat().filter( x => x.user == user ).map(x => x.room )
		
		arr = [...new Set(arr)]
	  
		let all = (await Message.findAll({
		  attributes: { 
			exclude: ['UserId', "roomId", "deletedAt", "updatedAt"]
		  },
		  include: [{
			model: Rooms,
			raw: true,
			where: {
			  room: {[Op.or]: arr }
			}
		  }, {
			model: Users,
			raw: true
		  }],
		  raw: true
		}))
		
		if( all.length === 0) return [];

		console.log( all )

		all = all.map( async x =>{ 
		  if( pos == x.link && x.link != null ){
			pos = 0;
			return;
		  }
		  if(x.link != null){ pos =  x.link}
	  
		  let t =  {
			id: x.id, 
			name:  x['User.username'], 
			message: (x.link != null ?  await messageResponce(x.id) : x.message), 
			room: x['room.room'], 
			time: x['room.createdAt'], 
			place: x['User.username'] == user ? "right" : "left",
			link: x.link
		  } 
	  
	  
		  return t
		  })
	  
	  return (await Promise.all(all)).filter(x => x != undefined )

		
	  }

  
	async chat(room, {message, user}) {
	  if( (await this.validate_RoombyCode(room) ) ) return;
	  let a = await this.getUser(user)
	
	  let foo = await (await this.get_RoombyCode(room) ).createMessage({ message });
	
	  foo.setUser(a.id);
	
	
	
	return {message, user}
	
	}
	
	async editMessage({id, new_message}) {
	let r = await Message.update({ message: new_message }, { where: {id}})
	
	return r 
	}
	
	async deleteMessage({id,name,place,room,time, message}) {
	  let r = await Message.destroy( { where: {id}})
	
	return r 
	}

	async getUsers(databace = Users){
		return (await databace.findAll({
			where: {
				type: {
					[Op.ne]: "buisness"
				}
			}
		}))
	}
	
	
  }



const user_Array = [
	{username: 'a', password: "a"},
	{username: 'b', password: "b"},
	{username: 'c', password: "c"},
	{username: 'd', password: "d"}
  ];
  

(async function () {
	await sequelize.sync({ force: false });

	const dat = new Bsiness_Account("buisnessAA")

	let Bsines = new Basic_Account(Buisness);


//await aaa.addBuisness( aaa.id )
/*
console.log( await dat.add_member("basic", "a", "a", "a", "a", "a@gmail.com") );

console.log( await dat.add_member("basic", "b", "b", "a", "a", "a@gmail.com") );
*/

	let a = new Basic_Account();
	let b = new Admin_Account();

	let c = new AppIcons();
/*
	await c.addAll();

	a.create("a", "a").then(() => {
		b.create("Malcolm", "MalcolmStoneAdmin22$", "admin").then(() => {
			b.name("Malcolm", "Malcolm", "Stone").then(console.log);
		});
	});
	*/

})();

module.exports = {	
	Account,
	Basic_Account,
	Admin_Account,
	AppIcons,

	Buisness
	
};



