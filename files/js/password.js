import {postData, appendAlert} from '../helper.js'

  
  const form1 = document.querySelector('#userTest1')
  //alertt box for the first message alert form in username re-naming
  const alertPlaceholder1 = document.getElementById('liveAlertPlaceholder1')
  
  //alertt box for the second message alert form in username re-naming
  const alertBox1 = document.getElementById('alertPlaceholder1')
  
  const fromThing1 = document.getElementById('userPet1')
  
  
  
  
  
  
  
  
  
 
  
  
  fromThing1.addEventListener('submit', event => {
    let text = document.getElementById("text1")
    let user = document.getElementById("validUsername1")
  
    if( text.value == user.value ){
      event.preventDefault()
      event.stopPropagation()
  
      appendAlert("you can not change your username to your current username","info",alertBox1)
    }
  })
  
  
   form1.addEventListener('submit', event => {
    let items = []
    // if (!form1.checkValidity()) {
       event.preventDefault()
       event.stopPropagation()
     //}
  
     form1.classList.add('was-validated')
     
   Array.from(form1.elements).forEach(x => {
         if( x.id == "validUsername1" || x.id == "validPassword1"){
           items.push( x.value )
         }
         
     })
     
  
       
  
       postData("/login",{
           type: "json",
           
           username: items[0],
           password: items[1]
       }).then(function(ele){
           if( ele[0].valid  ){
             appendAlert("you are logged in","success", alertPlaceholder1)
  
  
             Array.from(fromThing1.elements).forEach(element => {
   element.disabled = false  
   fromThing1.classList.remove("disabled")
   document.getElementById("userTest").classList.add("disabled")
             })
  
  
           }else{
             appendAlert(ele[0].message,"danger", alertPlaceholder1)
           }
       })
       
       
  }, false)
  
  
  
  
  
  