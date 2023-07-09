
function messageLeft({ id, name, place, room, time, message }) {
  let html = `
    <div class="row no-gutters" id="${id}" name="${name}" place="${place}" room="${room}" time="${time}">
            <div class="col-md-3">
              <div class="chat-bubble chat-bubble--left"  style="overflow-wrap: break-word">
              <button style="margin-left: 100px; margin-top: -3px; border-color: transparent; background-color: transparent; position: absolute; vertical-align: baseline;  class="menu-left"> <i class="material-icons" style="pointer-events: visibleFill">more_vert</i> </button>
                <span class="text">${message}</span>
              </div>
            </div>
        </div>
    `
  $(".chat-panel").append( $(html) )

}

function messageRight({ id, name, place, room, time, message }) {
  let html = `
    <div class="row no-gutters" id="${id}" name="${name}" place="${place}" room="${room}" time="${time}">
             <div class="col-md-3 offset-md-9">
               <div class="chat-bubble chat-bubble--right" style="overflow-wrap: break-word">
               <button style="margin-left: -40px; margin-top: -3px; border-color: transparent; background-color: transparent; position: absolute; vertical-align: baseline; z-index: 1000000;" class="menu-right">  <i class="material-icons" style="pointer-events: visibleFill">more_vert</i> </button>
               <span class="text">${message}</span>
               </div>
             </div>
           </div>
     `
  $(".chat-panel").append( $(html) )
}


function respondLeft({responses, message}) {
    let html = `
<div class="row no-gutters">
          <div class="col-md-7">
            <div class="chat-bubble chat-bubble--left" style="overflow-wrap: break-word">
            ${message}
               <div class="row no-gutters">
               Responded to:
               ${
                responses.map(x => {
                  let s = `<div class="col-md-9" style="background-color: #o74b9ff;">
                  <div class="chat-bubble-in chat-bubble--left" style="overflow-wrap: break-word; background-color: #d7d6d6;">
                  ${x}
                  </div>
                </div>`
              
                return s
                }).join( "<hr style='border: 0px solid transparent'>")
              }
        </div>
  
            </div>
          </div>
        </div>`

        $(".chat-panel").append(html)
  
}


function respondRight({responses, message}) {
    let html = `
    <div class="row no-gutters">
    <div class="col-md-7 offset-md-5">
      <div class="chat-bubble chat-bubble--right"style="overflow-wrap: break-word;">
              ${message}
  <div class="row no-gutters">
  Responded to:
${
  responses.map(x => {
    console.log( x )
    let s = `<div class="col-md-9" style="background-color: #cfcfcf;">
    <div class="chat-bubble-in chat-bubble--left" style="overflow-wrap: break-word; background-color: #b8deff;"> 
    ${x}
    </div>
  </div>`

  return s
  }).join( "<hr style='border: 0px solid transparent'>")
}
  </div>
        
        
      </div>
    </div>
  </div>`
    
            $(".chat-panel").append(html)

  
  }
  



function setSender(name) {
  $(".you > p:nth-of-type(1)").text(`Chatting with ${name}`)
}


function setPills(a, loc=".pills") {
  //if( loc = ".rooms")
  let html = `
   <div class="friend-drawer ${loc != ".pills" ? "group-drawer--onhover" : "friend-drawer--onhover"}">
 
        <div class="text">
          <h6>${a}</h6>
        </div>
      </div>
      <hr>
  `
  $(loc).append(html)
}



function send(text, username, t = ''){
  //{message: text, user: username}
  socket.emit( (t+"message"),  {message: text, user: username} );
  messageRight({message:text})
}


function receive(data) {
  messageLeft({message:data})
}

function changeRoom(room) {
  socket.emit("changeRoom", room)
}

function clearPills(loc=".pills") {
  $(`${loc} > *`).each(function (index) {
    $(this).remove()
  })

}
function clearMassages() {
  $(".chat-panel > *").each(function (index) {
    $(this).remove()
  })

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
