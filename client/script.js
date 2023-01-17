import bot from './assets/bot.svg'
import user from './assets/user.svg'

const form = document.querySelector("form");
const chatContainer = document.querySelector("#chat_container");

let loadInterval;

// Function to simulate ... animation while the AI is retrieving the data
function loader(element){
  element.textContent = '';

  loadInterval=setInterval(()=>{
    // Update the text content of the loading indicator
    element.textContent += '.';

    // If the loading indicator has reached three dots, reset it
    if (element.textContent === '....') {
        element.textContent = '';
    }
  }, 300);
}

// Function to type text letter by letter
function typeText(element, text){
  let index=0;

  let interval = setInterval(()=>{
    if(index < text.length){ //To check if the bot is still typing
      element.innerHTML += text.charAt(index); /*Will retrieve the text at a specific index from the text 
      returned by the AI*/
      index++;
    }else{
      clearInterval(interval);
    }
  }, 20)
}

// Functin to generate a uniqu ID for every message to map over them
function generateUniqueId(){
  const timeStamp = Date.now();
  const randomNummber = Math.random();
  const hexadecimalString = randomNummber.toString(16);

  return `id-${timeStamp}-${hexadecimalString}`
}

//
function chatStripe(isAi, value, uniqueId){

  return(`
  
    <div class="wrapper ${isAi && 'ai'}">
      <div id="chat">
        <div class="profile">
          <img 
            src="${ isAi ? bot : user }" 
            alt="${isAi ? 'bot' : 'user' }'" 
            />
        </div>
        <div class="message" id=${uniqueId}>${value}</div>
      </div>
    </div>
  
  `)
}

//Function to handle submit to trigger the AI generated response
const handleSubmit = async (e) =>{
  e.preventDefault(); // The default event when submitting a form is to reload the page

  // 
  const data = new FormData(form);

  //User's chatStripe
  chatContainer.innerHTML += chatStripe( false, data.get('prompt'));
  form.reset() //Clearing the text field after the user submits the data

  // Bot's Chatstripe
  const uniqueId = generateUniqueId();
  chatContainer.innerHTML += chatStripe(true, " " /*loader() will fill in the response data*/, uniqueId);
  
  // To enable scrolling  down and seeing the message as the user types, 
  chatContainer.scrollTop = chatContainer.scrollHeight;

  const messageDiv = document.getElementById(uniqueId);

  loader(messageDiv);

  // Fetch teh bot's response
 const response = await fetch('http://localhost:5000',{
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body:JSON.stringify({
        prompt: data.get('prompt')
      })
    })
    clearInterval(loadInterval); //As nothing would be loading after a data fetch
    messageDiv.innerHTML=' ';//It is not sure which part  of the loading is the code currently in

    if(response.ok){
      const data = await response.json(); //Actual response coming from the backend
      const parsedData = data.bot.trim();

      typeText(messageDiv, parsedData);
    }else{
      const err = await response.text();
      messageDiv.innerHTML = "Something went wrong";

      alert(err);
    }
}

// Event Listener for submitting using the submit button
form.addEventListener('submit', handleSubmit);
// Event Listener for submitting by pressing the enter key
form.addEventListener('keyup',(e)=>{
  if(e.keyCode === 13){ // 13 => Enter key
    handleSubmit(e);
  }
});
