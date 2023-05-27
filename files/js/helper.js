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

  //https://getbootstrap.com/docs/5.3/components/alerts/ for the message popups
const appendAlert = (message, type, location) => {
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


export {postData, appendAlert, findParent};
