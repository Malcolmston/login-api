function htmlCodepoints(arr) {
    return arr.map((codepoint) => String.fromCodePoint(codepoint)).join("");
  }
  
  
  
  
  (async function(){
        const exampleModal = document.getElementById('exampleModal')
    if (exampleModal) {
      exampleModal.addEventListener('show.bs.modal', event => {
        // Button that triggered the modal
        const button = event.relatedTarget
        // Extract info from data-bs-* attributes
        const recipient = button.getAttribute('data-bs-whatever')
  
        // Update the modal's content.
        const modalTitle = exampleModal.querySelector('.modal-title')
        const modalBodyInput = exampleModal.querySelector('.modal-body input')
  
        modalTitle.textContent = `New message to ${recipient}`
        modalBodyInput.value = recipient
      })
    }
    
    
    
        const metadata = await (
      await fetch(
        "https://raw.githubusercontent.com/googlefonts/emoji-metadata/main/emoji_14_0_ordering.json"
      )
    ).json();
    
  
      for (const data of metadata) {
      
      for (const emoji of data.emoji) {
        const button = document.createElement("button");
        button.setAttribute("role", "option");
        button.textContent = htmlCodepoints(emoji.base);
        button.className = "emoji";
        
  
  
       if( data.group == "Smileys and emotions"){
        document.querySelector("#nav-1").append( button )
         }
         if( data.group == "Animals and nature"){
              document.querySelector("#nav-2").append( button )
         }
         if( data.group == "People"){
        document.querySelector("#nav-3").append( button )
         }
         if( data.group == "Food and drink"){
        document.querySelector("#nav-4").append( button )
         }
         if( data.group == "Travel and places"){
        document.querySelector("#nav-5").append( button )
         }
         if( data.group == "Activities and events"){
        document.querySelector("#nav-6").append( button )
         }
         if( data.group == "Objects"){
        document.querySelector("#nav-7").append( button )
         }
          if( data.group == "Symbols"){
        document.querySelector("#nav-8").append( button )
         }
          if( data.group == "Flags"){
        document.querySelector("#nav-9").append( button )
         }
         
         
         
      }
      
      }
  })()