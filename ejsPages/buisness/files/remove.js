import {getData, postData, appendAlert} from '../../helper.js'


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




const form1 = document.querySelector("#userTest1")
const form2 = document.querySelector("#userPet1")

const formAlert = document.querySelector("#frmph") 
const formTwo = document.querySelector("#frmt") 
const formPot = document.querySelector("#aleyTim") 


const myModal = new bootstrap.Modal('#Delete')
const modalToggle = document.querySelector('#Delete'); 



var data = {}

async function checkUser(event){
   

    event.preventDefault()
    event.stopPropagation()

    form1.classList.add('was-validated')
     
    let obj = {}

  Array.from(form2.elements).forEach(x => {
        if( x.id == "text1" ){
           obj[x.id] = x.value
        }
        
    })
    
    let info = (await getData(`/user/${ obj['text1'] }`))[0]


    data["other_username"] = obj['text1']


    if( info.valid ){
        appendAlert("the account was found","success", formTwo).then(() => {
            myModal.show(modalToggle)



document.getElementById("softRemove").addEventListener("click",soft, false)
document.getElementById("hardRemove").addEventListener("click",hard, false)
        })

    
   }else{
        appendAlert( info.message, "danger", formTwo)
   }




}

async function checkLogin(event) {
    // if (!form1.checkValidity()) {
       event.preventDefault()
       event.stopPropagation()
     //}
  
     form1.classList.add('was-validated')
     
     let obj = {}
   Array.from(form1.elements).forEach(x => {
         if( x.id == "validUsername1" || x.id == "validPassword1"){
           

            obj[x.id] = x.value
         }
         
     })
     


      let info = (await postData("/admin/login",{
        username: obj["validUsername1"],
        password: obj["validPassword1"],
        type: "json"
     }))[0]

     data["your_username"] = obj["validUsername1"]
     data["your_password"] = obj["validPassword1"]


     if( info.valid ){
         appendAlert(info.message,"success", formAlert)

         Array.from(form2.elements).forEach(element => {
            element.disabled = false  
            form2.classList.remove("disabled")
            form1.classList.add("disabled")
                      })
  
                      

         form2.addEventListener("submit",checkUser, false)
    }else{
         appendAlert( info.message, "danger", formAlert)
    }

}


async function soft(event){    
    console.log( data )

    let info = (await postData("/business/admin/soft/remove", data))[0]
    data = {}

    if( info.valid ){
        appendAlert(info.message,"success", formPot)
   }else{
        appendAlert( info.message, "danger", formPot)
   }

}

async function hard(event){
    let info = (await postData("/business/admin/hard/remove", data))[0]
    data = {}

    if( info.valid ){
        appendAlert(info.message,"success", formPot)
   }else{
        appendAlert( info.message, "danger", formPot)
   }

}






form1.addEventListener("submit",checkLogin, false)



