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


  helpText.innerHTML = `Yow have selected phot number ${element.id}`
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