const applyClick = document.querySelector(".applyClick")
const helpText = document.querySelector(".helpText")
const ImageNumber = document.querySelector("[name='ImageNumber'] ") 


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