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

			validate: {
				isEmail: true
			}
		},

		username: {
			type: DataTypes.TEXT,
			//allowNull: false,
			//unique: false,

			validate: {
				isOff(value){
					let type = this.getDataValue('type');

					if( type != 'buisness' && (value == null) ){
						throw new Error('Username can not be null');
					}
				},

				async unique( value ){
					let type = this.getDataValue('type');

					let a = await Users.findOne({ where: { username: value } });

					if( type != 'buisness' && a !== null ){
						throw new Error('Username must be unique');
					}
				}

			}
		},

		password: {
			type: DataTypes.TEXT,
			unique: false,

			validate: {
				isOff(value){
					let type = this.getDataValue('type');

					if( type != 'buisness' && (value == null) ){
						throw new Error('Username can not be null');
					}
				}
			}
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

const Buisness = sequelize.define("buisness",{
	id: {
		type: Sequelize.INTEGER,
		autoIncrement: true,
		primaryKey: true,
	},

	name: {
		type: DataTypes.TEXT,
		allowNull: false,
		unique: false,
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


const Rooms = sequelize.define(
	"rooms",
	{
		id: {
			type: Sequelize.INTEGER,
			autoIncrement: true,
			primaryKey: true,
		},


		room: {
			type: DataTypes.TEXT,
			allowNull: false,
			unique: true,
		},

    "show-name": {
      type: DataTypes.TEXT,
			allowNull: true,
			unique: true,
    },
    name: {
			type: DataTypes.TEXT,
			allowNull: true,
			unique: false,
		},

		
	},
	{
		timestamps: true,

		deletedAt: "deletedAt",
		paranoid: true,
	}
);

const Message = sequelize.define(
	"message",
	{
		id: {
			type: Sequelize.INTEGER,
			autoIncrement: true,
			primaryKey: true,
		},


		message: {
			type: DataTypes.TEXT,
			allowNull: false,
			unique: false,
		},

    link: {
      type: DataTypes.INTEGER,
      allowNull: true,
      unique: false,
    }
  
		
	},
	{
		timestamps: true,

		deletedAt: "deletedAt",
		paranoid: true,
	}
);

const User_Room = sequelize.define('User_Room', {}, { timestamps: false });


Users.belongsToMany(Rooms, { through: User_Room });
Rooms.belongsToMany(Users, { through: User_Room });


Users.hasOne(Message);
Message.belongsTo(Users);

Rooms.hasOne(Message);
Message.belongsTo(Rooms);



Icons.hasMany(Users);
Users.belongsTo(Icons);


Buisness.hasMany(Users);
Users.belongsTo(Buisness);



const {
  Account,

	Basic_Account,
	Admin_Account,
	Bsiness_Account,
	AppIcons,
} = require(".././databace.js");



  function generateId (len) {
    return crypto.randomBytes(len).toString('hex');
  }



class Room extends Account {
  constructor(){

  }

  async getUser(username) {
    let type = this.getAccountType(username, Users)
    let p = await this.Account(username, type, Users)

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
        await t.addUser(rt)
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
  constructor(){

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
  
  
}



const user_Array = [
  {username: 'a', password: "a"},
  {username: 'b', password: "b"},
  {username: 'c', password: "c"},
  {username: 'd', password: "d"}
];


(async function(){
  const data = new  Basic_Account()


  await sequelize.sync({ force: false });




	let a = new Basic_Account();
	let b = new Admin_Account();

  let c = new Message_Controller();
  let d = new Room();


  let u = user_Array.map( obj => a.create(obj.username, obj.password) )

console.log( await Promise.all(u) )


let r =await d.createRoom( user_Array[0], user_Array[1] ) // await getRoombyUser(user_Array[0], user_Array[1])//await createRoom( user_Array[0], user_Array[2] )
console.log( r )

 
/*
let u = user_Array.map( createUser )

console.log( await Promise.all(u) )
*/
})();



module.exports = {createUser, getUser, validateUser, getUsers,createRoom, getRoombyUser, getGroupbyMembers, chat, getRoomsandChats, getGroupandChats, editMessage, deleteMessage, getGroups, getGroupbyName, changeGroupbyName};
