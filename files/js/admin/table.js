import {postData, appendAlert,findParent} from '../helper.js'

const alertPlaceholder = document.querySelector(".alertPlaceholder")

const ids = document.querySelectorAll(".id")
const fnames = document.querySelectorAll(".fname")
const lnames = document.querySelectorAll(".lname")
const emails = document.querySelectorAll(".email")
const usernames = document.querySelectorAll(".username")
const types = document.querySelectorAll(".type")
const createdAts = document.querySelectorAll(".createdAt")
const updatedAts = document.querySelectorAll(".updatedAt")
const deletedAts = document.querySelectorAll(".deletedAt")
const icons = document.querySelectorAll(".icon")


function selectItem(){
    let items = Array.from( document.querySelectorAll(".carousel-item") )
    return items.map( (x,count) => x.classList.contains("active") ? {item: x, index: count} : false ).filter(x=>x)[0].index

    
}

async function changeFname(e){
    let username, fname, type;

    for (const child of e.target.parentElement.children ) {
        if(child.className == "username"){ username = child.innerText } 
        if(child.className == "fname"){ fname = child.innerText }
        if(child.className == "type"){ type = child.innerText  }

      }

      let info = (await postData('/admin/fname', {username, fname, type}))[0]
    
    if( info.valid ){
        return appendAlert(info.message,"success", alertPlaceholder)
    }else{
        return appendAlert( info.message, "danger", alertPlaceholder)
    }
}

async function changeLname(e){
    let username, lname, type;

    for (const child of e.target.parentElement.children ) {
        if(child.className == "username"){ username = child.innerText } 
        if(child.className == "lname"){ lname = child.innerText }
        if(child.className == "type"){ type = child.innerText  }

      }

      let info = (await postData('/admin/lname', {username, lname, type}))[0]
    
    if( info.valid ){
        return appendAlert(info.message,"success", alertPlaceholder)
    }else{
        return appendAlert( info.message, "danger", alertPlaceholder)
    }
}

async function changeUsername(e){
    let username, new_username;

    for (const child of e.target.parentElement.children ) {
        if(child.className == "username"){ username = child.innerText } 
      }

      new_username = prompt("Enter a new username")
      if( new_username == undefined || new_username == null || new_username.length == 0 || new_username.trim().length == 0){ 
        appendAlert( "you must put a new username", "warning", alertPlaceholder)
        return
    }

      let info = (await postData('/admin/username', {username, new_username}))[0]
    
    if( info.valid ){
         appendAlert(info.message,"success", alertPlaceholder)
    }else{
         appendAlert( info.message, "danger", alertPlaceholder)
    }
}

async function changeIcon(e){


    let alertPlaceholder_Icon = document.querySelector(".alertIcon")


let myModal = new bootstrap.Modal('#Icon')
let modalToggle = document.querySelector('#Icon'); 


let submitButton = document.querySelector('#Submit')



//active

let username, ImageNumber;

    for (const child of findParent(e.target, "TR").children ) {
        if(child.className == "username"){ username = child.innerText } 
      }

      

      myModal.show(modalToggle)


      submitButton.addEventListener('click', async () => {
        ImageNumber = selectItem()

        
        let info = (await postData('/aplyIcon', { username,  ImageNumber: ImageNumber+1, type: "json"}))[0]
    
        if( info.valid ){
            return appendAlert(info.message,"success", alertPlaceholder_Icon)
        }else{
            return appendAlert( info.message, "danger", alertPlaceholder_Icon)
        }

    })

   
}



fnames.forEach(function(fname){
    fname.addEventListener("click",changeFname)
})


lnames.forEach(function(lname){
    lname.addEventListener("click",changeLname)
})


usernames.forEach(function(username){
    username.addEventListener("click",changeUsername)
})

icons.forEach(function(icon){
    icon.addEventListener("click",changeIcon)
})




