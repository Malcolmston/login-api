import {postData, appendAlert} from '../helper.js'

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

async function changeFname(e){//(username, first_name, account_type){
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

fnames.forEach(function(fname){
    fname.addEventListener("click",changeFname)
})




