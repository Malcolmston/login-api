import {postData} from '../../../files/js/helper.js'

// Example starter JavaScript for disabling form submissions if there are invalid fields
//https://getbootstrap.com/docs/5.3/forms/validation/
(() => {
 'use strict'

 // Fetch all the forms we want to apply custom Bootstrap validation styles to
 const forms = document.querySelectorAll('.needs-validation')

 // Loop over them and prevent submission
 Array.from(forms).forEach(form => {
   form.addEventListener('submit', event => {
     if (!form.checkValidity()) {
       event.preventDefault()
       event.stopPropagation()
     }

     form.classList.add('was-validated')
   }, false)
 })
})()


//https://getbootstrap.com/docs/5.3/components/alerts/ for the message popups
const appendAlert = (message, type, location = alertPlaceholder) => {
  const wrapper = document.createElement('div')
  wrapper.innerHTML = 
    `<div class="alert alert-${type} alert-dismissible" role="alert">
      <div>${message}</div>
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    </div>`
  
 
    location.append(wrapper)
 
  setTimeout(() => {
    wrapper.remove()
  }, 4000)
 }

 





const form = document.querySelector('#userTest')
//alertt box for the first message alert form in username re-naming
const alertPlaceholder = document.getElementById('liveAlertPlaceholder')

//alertt box for the second message alert form in username re-naming
const alertBox = document.getElementById('alertPlaceholder')

const fromThing = document.getElementById('userPet')

const dissabled = document.querySelectorAll(".disabled")





/**
* this function gets all element that have the disabled class and takes any input inside it and make it disabled.
* @param {HTMLFormElement} form the form that is selected
*/
dissabled.forEach(function(form){
  Array.from(form.elements).forEach(element => {
    element.disabled = true  
  })
})





fromThing.addEventListener('submit', event => {
  let text = document.getElementById("text")
  let user = document.getElementById("validUsername")

  if( text.value == user.value ){
    event.preventDefault()
    event.stopPropagation()

    appendAlert("you can not change your username to your current username","info",alertBox)
  }
})


 form.addEventListener('submit', event => {
  let items = []
  // if (!form.checkValidity()) {
     event.preventDefault()
     event.stopPropagation()
   //}

   form.classList.add('was-validated')
   
 Array.from(form.elements).forEach(x => {
       if( x.id == "validUsername" || x.id == "validPassword"){
         items.push( x.value )
       }
       
   })

     postData("/buisness/login",{
         type: "json",
         
         username: items[0],
         password: items[1]
     }).then(function(ele){
         if( ele[0].valid  ){
           appendAlert("you are logged in","success")


           Array.from(fromThing.elements).forEach(element => {
 element.disabled = false  
 fromThing.classList.remove("disabled")
 document.getElementById("userTest").classList.add("disabled")
           })


         }else{
           appendAlert(ele[0].message,"danger")
         }
     })
     
     
}, false)