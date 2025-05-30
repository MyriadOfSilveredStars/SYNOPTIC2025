//making the collapsible sections on the page
var coll = document.getElementsByClassName("collapsible");
var i;

for (i = 0; i < coll.length; i++) {
  coll[i].addEventListener("click", function() {
    this.classList.toggle("active");
    var content = this.nextElementSibling;
    if (content.style.display === "block") {
      content.style.display = "none";
    } else {
      content.style.display = "block";
    }
  });
} 

//event listener for the submit buttons
document.addEventListener('DOMContentLoaded', function() {
  const formElement = document.getElementById('updateSettingsForm');
  formElement.addEventListener('submit', updateSettings);
});

//function to process updating a user's settings
function updateSettings(e){
    e.preventDefault();
    const form = e.target;

    const firstName = form.firstName.value;
    const surname = form.surname.value;
    const age = form.userAge.value;
    const gender = form.userGender.value;
    const email = form.userEmail.value.trim();

    const height = form.userHeight.value;
    const weight = form.userWeight.value;
    const precons = form.userConditions.value;

    const bio = form.userProfile.value;

    //if some values aren't changed, take the placeholder values insead, as these are already in the database
    if (!firstName) {
      firstName = document.getElementById("firstName").placeholder; 
    }
    if (!surname) {
      surname = document.getElementById("surname").placeholder; 
    }
    if (!age) {
      age = document.getElementById("userAge").placeholder;  
    }
    if (!gender) {
      gender = document.getElementById("userGender").placeholder; 
    }
    if (!email) {
      email = document.getElementById("userEmail").placeholder; 
    }
    if (!height) {
      height = document.getElementById("userHeight").placeholder; 
    }
    if (!weight) {
      weight = document.getElementById("userWeight").placeholder; 
    }
    if (!precons) {
      precons = document.getElementById("userConditions").placeholder; 
    }
    if (!bio) {
      bio = document.getElementById("userProfile").placeholder; 
    }

    //make up the data object to send:
    data = {
      fname : firstName,
      lname : surname,
      age : age,
      gender : gender,
      email : email,
      height : height,
      weight : weight,
      precons : precons,
      profile : bio
    }

    const serializedData = JSON.stringify(data);
    const fetchOptions = {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: serializedData
    };

    fetch('https://localhost:3001/settings', fetchOptions)
        .then(onResponse)
        .then(onTextReady);
    
}

function onResponse(response) {
  //Checks to see if the action was successful
  const success = response.status === 200;
  //Return an object containing both response flag and text
  return response.text().then(text => {
      return {text, success};
  });
}

function onTextReady(result) {
  //Displays response message from server 
  console.log("Settings updated successfully!");
  alert("Settings updated!");
}