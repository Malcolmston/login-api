var crypto = require("crypto");
const  {createUser, getUser, validateUser, getUsers,createRoom, getRoombyUser, chat, getRoomsandChats, editMessage} = require("./databace.js")


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


  function generateId (len) {
    return crypto.randomBytes(len).toString('hex');
  }

  


const users = [
    {username: 'a', password: "Wt_JQfAhC4-YwIwqAAAF-"},
    {username: 'b', password: "W2nZTLxMltnoNiLKXAAAB"},
    {username: 'c', password: "W2nZTLxpw44oNiLKXAAAB"},
    {username: 'd', password: "wedfwerfewqwqedewdwed"}
]

const room_groups = []

const massages = []

function getRoom(...args){
   let s = generateId(10)
    return s
}

function validateRoom(room){
  return room_groups.filter( x => x.room == room ).isEmpty()
}

/*
function createRoom(...args) {
  if( !(room_groups.filter( x => x.users.arrSim(args.map(x=>x.username)) )).isEmpty() || !room_groups.filter( x => x.users.arrSim2( args.map(x=>x.username) )  ).isEmpty() ) return;
 
 let r = generateId(10)
     room_groups.push({
         users: args.map( x => x.username),
         room:r
    })
 
    return r
 }
 */
 

function addUser({username, password}) {
    if( users.find( x => x.username === username ) == undefined ) {
        users.push({username, password})
    }
}


  


//console.log(room_groups )



module.exports = {validateUser, getUsers, getRoombyUser, chat, getUser, createRoom, chat, getRoomsandChats};
