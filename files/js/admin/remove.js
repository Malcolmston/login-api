import {postData, appendAlert} from '../helper.js'


const form1 = document.querySelector("#userTest1")


async function checkLogin(event) {
    let items = []
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
     
     let info = await postData("admin/login",{
        username: obj["validUsername1"],
        password: obj["validPassword1"]
     })


     if( info.valid ){
         appendAlert(info.message,"success", alertPlaceholder)
    }else{
         appendAlert( info.message, "danger", alertPlaceholder)
    }

}

form1.addEventListener("submit",checkLogin, false)