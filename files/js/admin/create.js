
const noForms = document.querySelectorAll("form")
const db = document.querySelector("#accountType")
const username = document.querySelector("#password")


noForms.forEach(function(form){
  form.addEventListener("submit", event => {
    event.preventDefault()
    event.stopPropagation()
                        })
})


db.addEventListener("change", e => {
  if(e.target.value == "admin"){
    username.setAttribute("pattern", "[a-zA-Z0-9(\W|_)]{6,20}$")
    document.getElementById("valises").classList.replace("hide", "show")
  }else{
    document.getElementById("valises").classList.replace("show", "hide")
  }
})



let a = /[a-zA-Z0-9(\W|_)]{6,20}$/

let parts = {
"uppercase": {
regExp: (/[A-Z]/),
},

"letters": {
regExp: /[a-z]/,
},

"symble": {
regExp: /\W|_/,
},



}


function change(t) {
let r = t.value

if( parts["uppercase"].regExp.test( r) ) {
document.querySelector(".uppercase").classList.replace('false', "true")
}else{
document.querySelector(".uppercase").classList.replace('true', "false") 
}


if( parts["letters"].regExp.test( r ) ) {

document.querySelector(".letters").classList.replace('false', "true")
}else{
document.querySelector(".letters").classList.replace('true', "false") 
}

if( parts["symble"].regExp.test( r ) ) {

document.querySelector(".symble").classList.replace('false', "true")
}else{
document.querySelector(".symble").classList.replace('true', "false") 
}


if( r.length >= 6 && r.length <= 20) {
document.querySelector(".length").classList.replace('false', "true")
}else{
document.querySelector(".length").classList.replace('true', "false") 
}


if( a.test(r) ){
document.querySelector("#submit").disabled = false
}else {
document.querySelector("#submit").disabled = true
}

}