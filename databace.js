const bcrypt = require("bcrypt");
const crypto = require("crypto");
const path = require("path");
const fs = require("fs");

const sqlite3 = require("sqlite3");
const { Sequelize, DataTypes, Op, QueryTypes, where } = require("sequelize");

const db = new sqlite3.Database("uses.sqlite");
//https://github.com/sequelize/sequelize/issues/10304
const sequelize = new Sequelize("uses", "", "", {
	dialect: "sqlite",
	storage: "uses.sqlite",
	benchmark: true,
	standardConformingStrings: true,
	logging: false,
});

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

const Users = sequelize.define(
	"Users",
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
	}
);

Icons.hasMany(Users);
Users.belongsTo(Icons);

Users.sync();

class Account {
	// instance
	static getFileBuffer(fullPath) {
		let filepath = path.resolve(__dirname, fullPath);
		let profilePicture = Buffer.from(fs.readFileSync(filepath));

		return profilePicture;
	}

	// instance
	static allInfolder(folder = "images") {
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

	// instance
	static Account(username, type) {
		return new Promise(async function (resolve) {
			let res = await Users.findOne({
				where: {
					username: username,
					type: type, //"basic"
				},
			});

			resolve(res);
		});
	}

	// instance
	static get Name() {
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

	// instance
	static password_hide(text) {
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

	// instance
	static password_simi(password, hash) {
		return new Promise((resolve, reject) => {
			bcrypt.compare(password, hash, function (err, result) {
				resolve(result);
			});
		});
	}
}

class AppIcons extends Account {
	static callAccount =  Account;


	static async exsist(image) {
		let a = await Icons.findOne({
			where: { icon: image },
		});

		return a !== null;
	}

	/**
	 * this function will eiter retiver or create the given image file
	 *  @param {String} image this usese a complex string of a file in the images folder
	 * @returns {promises} return a sequelize object of the file callAccount is chosen or created
	 */
    static async addFile(image) {
		let profilePicture = this.callAccount.getFileBuffer(`images/${image}.svg`);

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

	static async addBolck(...images) {
		let arr = [];

		let r = this;
		arr = images.map(async (x, index) => {
			let profilePicture = r.callAccount.getFileBuffer(`images/${x}`);

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

	static async addAll() {
		let all = await this.callAccount.allInfolder();

		return await this.addBolck(...all);
	}

	static get getImages() {
		return Icons.findAll();
	}
}

class Basic_Account {
	static callAccount =  Account;

	/**
	 * this function will get if an account is deleted
	 * @param {String} username is the users username
	 * @returns {promises} true if the account is deleted otherwise it will return true
	 */
	 static async isDeleted(username) {
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
	  static async validate(username, password) {
		let pwd = await this.callAccount.password_hide(password);

		let del = await this.isDeleted(username);

		if (del) {
			return false;
		}

		let res = await this.callAccount.Account(username, "basic");
		if( res === null) return false;

		let a = await this.callAccount.password_simi(password, res.password);

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
	//class spicivic static
   static async account(username) {
		let res = await Users.findOne({
			where: {
				username: username,
				type: "basic",
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
	 * @returns {promises}
	 */
	static async name(username, fname, lname) {
		let bool = await this.callAccount.Account(username, "basic");

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
	 * @param {String} url is the url of a img callAccount you want as the cantact image for a user
	 * @returns {promises}
	 */
	static async icon(username, id) {
		let bool = await this.callAccount.Account(username, "basic");

		if (bool === null) return false;

		const img = await Icons.findByPk(id);

		return await img.addUsers([bool]);
	}

	static async get_icon(username) {
		let bool = await this.callAccount.Account(username, "basic");

		if (bool === null) return false;

		return await bool.getIcons();
	}

	static async create(username, password) {
		let bool = await this.account(username);

		if (bool) return;

		let p = await this.callAccount.password_hide(password);

		let a = await Users.create({
			username: username,
			password: p,
			type: "basic",
		});

		return a;
	}

	static async remove(username, password) {
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

	static async update_username(username, c) {
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

	static async update_password(username, c) {
		let e = await this.password_hide(c.toString());

		let d = await Users.update(
			{ password: e },
			{
				where: { username: username, type: "basic" },
			}
		);

		return d;
	}

	static async getAccount(username) {
		let a = (await this.callAccount.Account(username, "basic")).toJSON();

		return a;
	}
}

class Admin_Account  {
	constructor() {
		super();
	}
	static callAccount =  Account;
	static basic =  Basic_Account;

	/**
	 * this function will get if an account is deleted
	 * @param {String} username is the users username
	 * @returns {promises} true if the account is deleted otherwise it will return true
	 */
	static async isDeleted(username, type = "admin") {
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

	static async validate(username, password) {
		let del = await this.isDeleted(username);

		if (del) {
			return false;
		}

		let res = await this.callAccount.Account(username, "admin");
		let a = await this.callAccount.password_simi(password, res.password);

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

	static async account(username) {
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
	static async name(username, fname = false, lname = false, type = "admin") {
		let bool = await this.callAccount.Account(username, type);

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
	 * @param {String} url is the url of a img callAccount you want as the cantact image for a user
	 * @returns {promises}
	 */
	static async icon(username, id) {
		let bool = await this.callAccount.Account(username, "admin");

		if (bool === null) return false;

		const img = await Icons.findByPk(id);

		return await bool.setIcon(img);
	}
	//https://sequelize.org/docs/v6/core-concepts/assocs/#foohasonebar
	static async get_icon(username) {
		let bool = await this.callAccount.Account(username, "admin");

		if (bool === null) return false;

		return await bool.getIcon();
	}

	static async apply_icon(username, type) {
		let bool = await this.callAccount.Account(username, type);

		if (bool === null) return false;

		const img = await Icons.findByPk(id);
	
		return await img.addUsers([bool]);
	}

		/**
	 * this function will allow admin users to create new Icons
	 * @param {String} username username of the account of thr Admin user
	 * @param {String} password password of the account of thr Admin user
	 * @param {String} image this usese a complex string of a file in the images folder
	 * @returns {promises} return a sequelize object of the file callAccount is chosen or created. if the given username and password are invalid then it will return false
	 */
	static async addIcon(username, password, image) {
			let tv = await this.validate(username, password)

			if(tv){
			let profilePicture = this.callAccount.getFileBuffer(`images/${image}.svg`);
	
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
	static async check(username, password) {
		let pwd = await this.callAccount.password_hide(password);

		let a = await this.callAccount.password_simi(password, pwd);

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

	

	static async create(username, password, type) {
		let bool = await this.callAccount.account(username);

		if (bool) return;

		let p = await this.callAccount.password_hide(password);
		let reg = /[a-zA-Z0-9!@#$%^&*]{6,16}$/;

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

	static async soft_remove(username, password, Busername) {
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

	static async hard_remove(username, password, Busername) {
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

	static async restore(username, Yusername, Ypassword) {
		let c1 = await this.basic.account(username);
		let c2 = await this.validate(Yusername, Ypassword);

		if (!c1 && !c2) {
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

	static async update_username(username, c) {
		let d = await Users.update(
			{ username: c },
			{
				where: { username: username },
			}
		);

		return d;
	}

	static async update_password(username, c) {
		let e = await this.callAccount.password_hide(c.toString());

		let d = await Users.update(
			{ password: e },
			{
				where: { username: username },
			}
		);

		return d;
	}

	static async getAll() {
		let all = await Users.findAll({ paranoid: false });

		return all;
	}
}

(async function () {
	await sequelize.sync({ force: false });

	/*
	//let user1 = await a.create("a", "a")
	let user2 = await a.create("b", "b")

	//let icon1 = await c.addFile('3')
	let icon2 = await c.addAll()//.addFile('7')


	//await user1.setIcon(icon1);
	//await user2.setIcon(icon2);
	*/

	let a =  Basic_Account//();
	let b = Admin_Account//();

	let c =  AppIcons

	await c.addAll();

	a.create("a", "a").then(() => {
		b.create("Malcolm", "MalcolmStoneAdmin22", "admin").then(() => {
			b.name("Malcolm", "Malcolm", "Stone").then(console.log);
		});
	});
})();

module.exports = {
	Basic_Account,
	Admin_Account,
	AppIcons,
};
