const socket = io();


const pills = $(".tab")

const chat_sender = $(".chatting")

const menu = $(".menu");
var tabs = $(".tab");

const textarea = $("textarea");
const sendChat = $(".send");


function setSender(name){
  let html = chat_sender.html(`Chat with ${name}`);
}

function getSender(){
  return chat_sender.text().replace("Chat with ","");
}

function setPills(arr, online){
  arr.map( x => {
    let html = `
    <div class="tab">
    <p class="name">${x}</p>
    <div class="dot ${online.includes(x) ? "active" : "inactive"}">
        <span class="status">Offline</span>
    </div>
  </div>
  `

  menu.append( html )
  })
  
}



function clearPills(){
$(".tab").each(function( index ) {
  $( this ).remove() 
})

}



function messageLeft(time, text){
  let html = `
   <div class="bg-light border mb-3" style="max-width: 19rem;">
  <div class="card-body">
    <div class="time">${time}</div>
    <p class="text">${text}</p>
  </div>
</div>
  `  

  $(".chat").append(html)
}

function messageRight(time, text){
  let html = `
   <div class="bg-light border mb-3 right" style="max-width: 19rem;">
  <div class="card-body">
    <div class="time">${time}</div>
    <p class="text">${text}</p>
  </div>
</div>
  `  
  $(".chat").append(html)
}




function clearChat(){
  $(".chat > *:not(span)").replaceWith("")
}


function loadChat(name){
  let item = sessionStorage.getItem(name)
  if( item == undefined || item == null || JSON.parse(item).length == 0 ) return;


  (Array.isArray(JSON.parse(item) ) ? JSON.parse(item) :Array(JSON.parse(item)) ).forEach( x => {
    if( x.place == "right"){
      messageRight(x.time, x.message)
    }else{
      messageLeft(x.time, x.message)
    }
  })
}



function send(text, username, t = ''){
  //{message: text, user: username}
  socket.emit( (t+"message"),  {message: text, user: username} );
  messageRight("",text )

}

function receive(data){  
  messageLeft("", data)
}

function changeRoom(room){
  socket.emit("changeRoom", room )
}

function changeRoomBIS(room){
  socket.emit("business changeRoom", room )
}


