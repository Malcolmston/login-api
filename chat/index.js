//https://codehandbook.org/how-to-remove-an-element-from-javascript-array/
Array.prototype.remove = function(elem) {
    var index = this.indexOf(elem)
    var removed_element = this.splice(index, 1)
    return this
  }

  


// npm install ejs express express-session socket.io crypto express-stylus nib path

const  {createUser, getUser, validateUser, getUsers,createRoom, getRoombyUser, getGroupbyName, chat, getRoomsandChats, getGroupandChats, editMessage, deleteMessage, getGroups, changeGroupbyName} = require("./databace.js")

//const {createUser, getUser, validateUser, getUsers} = require("./databace.js")

var stylus = require('express-stylus');
var nib = require('nib');
var join = require('path').join;
var publicDir = join(__dirname, '/views');
 


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

app.use(stylus({
    src: publicDir,
    use: [nib()],
    import: ['nib']
  }));
app.use(express.static(publicDir));

//looks inside the images folder
//app.use("/ejsPages", express.static("ejsPages"));

const stats = []

	app.get("/", async (req, res) => {
        var {authenticated, username} = req.session
        let users = await getUsers()
        let groups = await getGroups();

        if( !authenticated){
		    res.render("main");
        }else if( authenticated ){
            downloaded = {normal: (await getRoomsandChats(username)), group: (await getGroupandChats(username)) }
            stats.push(username);

            res.render("message", {
                users: JSON.stringify(users.map(x => x.username).filter( x => x !== username )),
                groups:  JSON.stringify(groups.map( x => x.name )),
                username,
                downloaded: JSON.stringify(downloaded),
                stats
            });
        }
	});

    app.post("/login", async (req, res) => {
       let {username} = req.body


if( ! await validateUser(username) ){
    res.status(400);
    req.session.authenticated = false

}
       req.session.username = username
       req.session.authenticated = true

       res.redirect("/")

    })


const server = require('http').createServer(app);
const io = require('socket.io')(server);



io.engine.use(sessionMiddleware);


io.on('connection', (socket) => {
    var {username,authenticated} = socket.request.session

    if(!authenticated){
        socket.disconnect;
    }

    io.emit("users", stats)
    io.emit('groups', stats)


    socket.on("changeRoom", async (room_users) => {  
        let a = room_users.map(async x => await getUser(x))
        let b = (await Promise.all(a)).filter( x => x != undefined)

        let room = ( await getRoombyUser(...b  ) ).room

        if( room == undefined){
            room = await createRoom( ...b )
        }

        socket.join(room )
        socket.roomPlace = room

        socket.emit("changeRoom", socket.roomPlace)
    })

    socket.on("changeGroup", async (group_name) => {  
       let a = await getGroupbyName(group_name)
        let room = a.room

        if( room == undefined) return;

        socket.join(room )
        socket.roomPlace = room

        socket.emit("changeGroup", socket.roomPlace)

        /*
        let a = group_name.map(async x => await getUser(x))
        let b = (await Promise.all(a)).filter( x => x != undefined)

        let room = ( await getRoombyUser(...b  ) ).room

        if( room == undefined){
            room = await createRoom( ...b )
        }

        socket.join(room )
        socket.roomPlace = room

        socket.emit("changeRoom", socket.roomPlace)
        */
    })

    socket.on('message', async (obj) => {
        if( ! socket.roomPlace ) return;

        downloaded = JSON.stringify((await getRoomsandChats(username)))

        let  {message, user}  = obj

        await chat( socket.roomPlace, {message, user} )
        socket.in( socket.roomPlace ).emit('message', obj.message, user)

        //socket.in(socket.id).emit("update",downloaded )
    })

    socket.on("editMessage", async (obj) => {
       let a = await editMessage(obj)
    })

    socket.on("deletMessage", async (obj) => {
        let a = await deleteMessage(obj)
     })

    socket.on("disconnect", () => {
       stats.remove(username)
       io.emit("users", stats)
      });
    

});


server.listen(3000, function() {
    console.log(`Listening on port ${3000}`);
  });
