const box = document.querySelectorAll('#show')[0];
const lable = document.querySelectorAll("#psw")[0];
const password = document.querySelectorAll("#password")[0];




const forms = document.querySelectorAll("form")

//this handles the hide vs show passowd in form. It will also place the curser at the end of the line
box.addEventListener("change",function(element) {
        let len = password.value.length
        if( box.checked ){
            lable.innerText = "hide your password"

            password.setAttribute("type","text")

            password.setSelectionRange(len, len);
        }else{
            lable.innerText = "show your password"

            password.setAttribute("type","password")

            password.setSelectionRange(len, len);
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

//parts["uppercase"].regExp

//let r = "Malcolmstone19@"
document.querySelector("#submit").disabled = true

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

function change1(t) {
    let r = t.value
    
    if( parts["uppercase"].regExp.test( r) ) {
    document.querySelector(".uppercase1").classList.replace('false', "true")
    }else{
    document.querySelector(".uppercase1").classList.replace('true', "false") 
    }
    
    
    if( parts["letters"].regExp.test( r ) ) {
    
    document.querySelector(".letters1").classList.replace('false', "true")
    }else{
    document.querySelector(".letters1").classList.replace('true', "false") 
    }
    
    if( parts["symble"].regExp.test( r ) ) {
    
    document.querySelector(".symble1").classList.replace('false', "true")
    }else{
    document.querySelector(".symble1").classList.replace('true', "false") 
    }
    
    
    if( r.length >= 6 && r.length <= 20) {
    document.querySelector(".length1").classList.replace('false', "true")
    }else{
    document.querySelector(".length1").classList.replace('true', "false") 
    }
    
    
    if( a.test(r) ){
    document.querySelector("#submit1").disabled = false
    }else {
    document.querySelector("#submit1").disabled = true
    }
    
    }


//document.querySelector(".admin_login > [type='password']").addEventListener("keyup", change, false)


