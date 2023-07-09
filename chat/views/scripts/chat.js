const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

if (typeof SpeechRecognition === "undefined") {
  startBtn.remove();
  result.innerHTML = "<b>Browser does not support Speech API. Please download latest chrome.<b>";
}


const recognition = new SpeechRecognition();
recognition.continuous = true;
recognition.interimResults = true;


recognition.onresult = event => {
   let last = event.results.length - 1;
   let res = event.results[last];
   let text = res[0].transcript;
   if (res.isFinal) { 
  $(".chat-box-tray > input").val( text );
   } 
}

let listening = false;
toggleBtn = () => {
   if (listening) {
      recognition.stop();
   } else {
      recognition.start();
   }
   listening = !listening;
};

