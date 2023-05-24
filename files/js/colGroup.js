/**
  * this function fetes data using a post method. 
  * @param {String} url the url to fetch from
  * @param {Object} data is what is being posted 
  * @returns {Promise<JSON>} onse resolved it will fetch the response data
  * @see  thanks too https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch for the following code
  */
 async function postData(url = "", data = {}) {
   // Default options are marked with *
   const response = await fetch(url, {
     method: "POST", // *GET, POST, PUT, DELETE, etc.
     mode: "cors", // no-cors, *cors, same-origin
     cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
     credentials: "same-origin", // include, *same-origin, omit
     headers: {
       "Content-Type": "application/json",
       // 'Content-Type': 'application/x-www-form-urlencoded',
     },
     redirect: "follow", // manual, *follow, error
     referrerPolicy: "no-referrer", // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
     body: JSON.stringify(data), // body data type must match "Content-Type" header
   });
   return response.json(); // parses JSON response into native JavaScript objects
 }





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

const allnameForms = document.querySelectorAll('[action="/aplyName"]')
const ImageNumber = document.querySelector("[name='ImageNumber'] ") 
const applyClick = document.querySelector(".applyClick")
const helpText = document.querySelector(".helpText")
const nameDP = document.querySelector(".name")
const form = document.querySelector('.needs-feedback')
//alertt box for the first message alert form in username re-naming
const alertPlaceholder = document.getElementById('liveAlertPlaceholder')

//alertt box for the second message alert form in username re-naming
const alertBox = document.getElementById('alertPlaceholder')

const fromThing = document.getElementById('userPet')

const dissabled = document.querySelectorAll(".disabled")



const clickedElements = []

function selected( element ){
  clickedElements.push( element )


  applyClick.disabled = false;

  ImageNumber.value = element.id

  if( clickedElements.length > 1 ){
    clickedElements.forEach(element => {
      element.classList.remove("selected")
    })
  }
  element.classList.add("selected")


  helpText.innerHTML = `Yow have selected photo number ${element.id}`
}

nameDP.addEventListener("change",function(){
  allnameForms.forEach(function (form) {
    let cl = form.classList
    if( cl.contains('show') ){
    form.classList.replace('show', 'hide')
    }
  })

      document.querySelector(`.${this.value}`).classList.replace('hide', 'show')
     
})





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
      


      postData("/login",{
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


/**
 * this function gets all element that have the disabled class and takes any input inside it and make it disabled.
 * @param {HTMLFormElement} form the form that is selected
 */
dissabled.forEach(function(form){
     Array.from(form.elements).forEach(element => {
       element.disabled = true  
     })
})





const toastLiveExample = document.querySelector('.toast-container > #liveToast')
const forms = document.querySelectorAll('form')
  const toastBootstrap = bootstrap.Toast.getOrCreateInstance(toastLiveExample)

// from https://getbootstrap.com/docs/5.0/components/toasts/
  const toast = () => {
    this.addEventListener('click', () => {
      toastBootstrap.show()
    })
    
    }