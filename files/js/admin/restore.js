import {getData, postData, appendAlert} from '../helper.js'


const dissabled = document.querySelectorAll(".dissabled")
/**
* this function gets all element that have the disabled class and takes any input inside it and make it disabled.
* @param {HTMLFormElement} form the form that is selected
*/
dissabled.forEach(function(form){
    Array.from(form.elements).forEach(element => {
      element.disabled = true  
    })
  })




const form1_restore = document.querySelector("#userTest11")
const form2_restore = document.querySelector("#userPet11")

const formAlert_restore = document.querySelector("#frmph11") 
const formTwo_restore = document.querySelector("#frmt11") 
const formPot_restore = document.querySelector("#aleyTim11") 


const myModal_restore = new bootstrap.Modal('#Restore')
const modalToggle_restore = document.querySelector('#Restore'); 



var data = {}

async function checkUser_restore(event){
   
    event.preventDefault()
    event.stopPropagation()

    form1_restore.classList.add('was-validated')
     
    let obj = {}

  Array.from(form2_restore.elements).forEach(x => {
        if( x.id == "text11" ){
           obj[x.id] = x.value
        }
        
    })
    
    let info = (await getData(`/user/deleted/${ obj['text11'] }`))[0]


    data["other_username"] = obj['text11']


    if( info.valid ){
        appendAlert("the account was found","success", formTwo_restore).then(() => {
            myModal_restore.show(modalToggle_restore)

            console.log( data )

document.querySelector("#restore").addEventListener("click",restore_restore, false)
        })

    
   }else{
        appendAlert( info.message, "danger", formTwo_restore)
   }




}

async function checkLogin_restore(event) {
    // if (!form1.checkValidity()) {
       event.preventDefault()
       event.stopPropagation()
     //}
  
     form1_restore.classList.add('was-validated')
     
     let obj = {}
   Array.from(form1_restore.elements).forEach(x => {
         if( x.id == "validUsername11" || x.id == "validPassword11"){

            obj[x.id] = x.value
         }
     })
     


      let info = (await postData("/admin/login",{
        username: obj["validUsername11"],
        password: obj["validPassword11"],
        type: "json"
     }))[0]

     data["your_username"] = obj["validUsername11"]
     data["your_password"] = obj["validPassword11"]


     if( info.valid ){
         appendAlert(info.message,"success", formAlert_restore)

         Array.from(form2_restore.elements).forEach(element => {
            element.disabled = false  
            form2_restore.classList.remove("disabled")
            form1_restore.classList.add("disabled")
                      })
  
                      

         form2_restore.addEventListener("submit",checkUser_restore, false)
    }else{
         appendAlert( info.message, "danger", formAlert_restore)
    }

}


async function restore_restore(event){    
    let info = (await postData("/admin/restore", data))[0]
    data = {}

    if( info.valid ){
        appendAlert(info.message,"success", formPot_restore)
   }else{
        appendAlert( info.message, "danger", formPot_restore)
   }

}






form1_restore.addEventListener("submit",checkLogin_restore, false)



