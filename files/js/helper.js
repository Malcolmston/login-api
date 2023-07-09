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

/**
  * this function fetes data using a get method. 
  * @param {String} url the url to fetch from
  * @returns {Promise<JSON>} onse resolved it will fetch the response data
  * @see  thanks too https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch for the following code
  */
async function getData(url = "") {
  // Default options are marked with *
  const response = await fetch(url, {
    method: "GET", // *GET, POST, PUT, DELETE, etc.
    mode: "cors", // no-cors, *cors, same-origin
    cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
    credentials: "same-origin", // include, *same-origin, omit
    headers: {
      "Content-Type": "application/json",
      // 'Content-Type': 'application/x-www-form-urlencoded',
    },
    redirect: "follow", // manual, *follow, error
    referrerPolicy: "no-referrer", // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
  });
  return response.json(); // parses JSON response into native JavaScript objects
}


async function getText(url = "") {
  // Default options are marked with *
  const response = await fetch(url, {
    method: "GET", // *GET, POST, PUT, DELETE, etc.
    mode: "cors", // no-cors, *cors, same-origin
    cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
    credentials: "same-origin", // include, *same-origin, omit
    headers: {
      "Content-Type": "application/json",
      // 'Content-Type': 'application/x-www-form-urlencoded',
    },
    redirect: "follow", // manual, *follow, error
    referrerPolicy: "no-referrer", // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
  });

  console.log( response )
  return response.text(); // parses JSON response into native JavaScript objects
}


  //https://getbootstrap.com/docs/5.3/components/alerts/ for the message popups
const appendAlert = (message, type, location) => {
  return new Promise((resolve, reject) => {
    const wrapper = document.createElement('div')
    wrapper.innerHTML = 
      `<div class="alert alert-${type} alert-dismissible" role="alert">
        <div>${message}</div>
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
      </div>`
    
  
      location.append(wrapper)
  
    setTimeout(() => {
      wrapper.remove()
      resolve(true)
    }, 4000)
  })

}





/**
 * 
 * @param {HTMLElement} element an html element that has many parents 
 * @param {String} tg tag name and must be uppercase
 * @returns {undefined, HTMLElement} returns undefined once the function reaches the root element or returns the element if it can be found.
 * @example let id = document.querySelector('#id')

let arr = []


id.addEventListener("click",function(e){
    console.log( findParent(e.target, "BODY") )
})
 */

  function findParent(element, tg){
    if(   element.tagName ==  "HTML") return;
    if( element.tagName == tg){
         return element
     }else {
         return findParent( element.parentElement,tg )
     }
}

function run(ids, fnames, lnames, emails, usernames, types, createdAts, updatedAts, deletedAts, icons = null) {
  const alertPlaceholder = document.querySelector(".alertPlaceholder")
  
  
  if( [...ids].length == 0){
     return;  
  }
  console.log({ids, fnames, lnames, emails, usernames, types, createdAts, updatedAts, deletedAts, icons})
  
  
  
  function selectItem(){
      let items = Array.from( document.querySelectorAll(".carousel-item") )
      return items.map( (x,count) => x.classList.contains("active") ? {item: x, index: count} : false ).filter(x=>x)[0].index 
  }
  
  async function changeFname(e){
      let username, fname, type;
  
      for (const child of e.target.parentElement.children ) {
          if(child.className == "username"){ username = child.innerText } 
          //if(child.className == "fname"){ fname = child.innerText }
          if(child.className == "type"){ type = child.innerText  }
  
        }
  
        fname = prompt("first name") 
  
        if( fname == "" || fname.trim() == "" || fname == null || fname == undefined ){
          appendAlert( "you must put a first name", "warning", alertPlaceholder)
          return;
        }
        let info = (await postData('/admin/fname', {username, fname, type}))[0]
      
      if( info.valid ){
           appendAlert(info.message,"success", alertPlaceholder)
      }else{
           appendAlert( info.message, "danger", alertPlaceholder)
      }
  }
  
  async function changeLname(e){
      let username, lname, type;
  
      for (const child of e.target.parentElement.children ) {
          if(child.className == "username"){ username = child.innerText } 
       //   if(child.className == "lname"){ lname = child.innerText }
          if(child.className == "type"){ type = child.innerText  }
  
        }
  
        lname = prompt("Last name") 
  
        if( lname == "" || lname.trim() == "" || lname == null || lname == undefined ){
          appendAlert( "you must put a last name", "warning", alertPlaceholder)
          return;
        }
  
        let info = (await postData('/admin/lname', {username, lname, type}))[0]
      
      if( info.valid ){
           appendAlert(info.message,"success", alertPlaceholder)
      }else{
           appendAlert( info.message, "danger", alertPlaceholder)
      }
  }
  
  async function changeUsername(e){
      let username, new_username;
  
      for (const child of e.target.parentElement.children ) {
          if(child.className == "username"){ username = child.innerText } 
        }
  
        new_username = prompt("Enter a new username")
        if( new_username == undefined || new_username == null || new_username.length == 0 || new_username.trim().length == 0){ 
          appendAlert( "you must put a new username", "warning", alertPlaceholder)
          return
      }
  
        let info = (await postData('/admin/username', {username, new_username}))[0]
      
      if( info.valid ){
           appendAlert(info.message,"success", alertPlaceholder)
      }else{
           appendAlert( info.message, "danger", alertPlaceholder)
      }
  }
  
  async function changeIcon(e){
  
  
      let alertPlaceholder_Icon = document.querySelector(".alertIcon")
  
  
  let myModal = new bootstrap.Modal('#Icon')
  let modalToggle = document.querySelector('#Icon'); 
  
  
  let submitButton = document.querySelector('#Submit')
  
  
  
  //active
  
  let username, ImageNumber;
  
      for (const child of findParent(e.target, "TR").children ) {
          if(child.className == "username"){ username = child.innerText } 
        }
  
        
  
        myModal.show(modalToggle)
  
  
        submitButton.addEventListener('click', async () => {
          ImageNumber = selectItem()
  
          
          let info = (await postData('/aplyIcon', { username,  ImageNumber: ImageNumber+1, type: "json"}))[0]
      
          if( info.valid ){
              return appendAlert(info.message,"success", alertPlaceholder_Icon)
          }else{
              return appendAlert( info.message, "danger", alertPlaceholder_Icon)
          }
  
      })
  
     
  }
  
  
  
  fnames.forEach(function(fname){
      fname.addEventListener("click",changeFname)
  })
  
  
  lnames.forEach(function(lname){
      lname.addEventListener("click",changeLname)
  })
  
  
  usernames.forEach(function(username){
      username.addEventListener("click",changeUsername)
  })
  
  if( icons !== null ) {
  icons.forEach(function(icon){
      icon.addEventListener("click",changeIcon)
  })
  }
  
  
  
  
  }
  
  
  

export {postData, getData,getText, appendAlert, findParent, run};
