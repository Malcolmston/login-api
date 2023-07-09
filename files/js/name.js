const allnameForms = [...document.querySelectorAll('[action="/aplyName"]')].length == 0 ? document.querySelectorAll('[action="/buisness/aplyName"]') : document.querySelectorAll('[action="/aplyName"]')

const nameDP = document.querySelector(".name")

console.log( )

nameDP.addEventListener("change",function(){
    allnameForms.forEach(function (form) {
      let cl = form.classList
      if( cl.contains('show') ){
      form.classList.replace('show', 'hide')
      }
    })
  
        document.querySelector(`.${this.value}`).classList.replace('hide', 'show')
       
  })
  
  
  