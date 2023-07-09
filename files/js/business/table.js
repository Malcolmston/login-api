import { run, appendAlert, getText} from '../../js/helper.js'

const socket = io();
const alertPlaceholder = document.querySelector(".alertPlaceholder")
document.getElementById("clickButton").addEventListener("click", () => {
  socket.emit('business send Table')
})
    
window.onload = () => {
    socket.emit('business table reload' )
  socket.emit('business send Table' )
}

socket.on('send Table Error', (message) => {
  appendAlert(message, 'warning', alertPlaceholder, 2000)
})

socket.on('send Table', (info) => {  

    getText( "../ejsPages/admin/table.ejs").then(function( data ) {
    let html = ejs.render(data, {items: info}, {delimiter: '?'})
  
    document.getElementById("table").innerHTML = html 
    //console.log(html, info)
  var ids = document.querySelectorAll(".id")
  var fnames = document.querySelectorAll(".fname")
  var lnames = document.querySelectorAll(".lname")
  var emails = document.querySelectorAll(".email")
  var usernames = document.querySelectorAll(".username")
  var types = document.querySelectorAll(".type")
  var createdAts = document.querySelectorAll(".createdAt")
  var updatedAts = document.querySelectorAll(".updatedAt")
  var deletedAts = document.querySelectorAll(".deletedAt")
  
  run(ids, fnames, lnames, emails, usernames, types, createdAts, updatedAts, deletedAts)
  
  })


})
