document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('logInForm');
    const forgotPasswordLink = document.getElementById('forgotPasswordLink');
    const backToLoginLink = document.getElementById('backToLoginLink');
    const forgotPasswordForm = document.getElementById('forgotPasswordForm');
    const loginContainer = document.getElementById('login-container');
    const forgotContainer = document.getElementById('forgotPassword-container');
    
    loginForm.addEventListener('submit', processSubmit);
    
    //Toggle to forgot password form
    forgotPasswordLink.addEventListener('click', function(e) {
      e.preventDefault();
      loginContainer.style.display = 'none';
      forgotContainer.style.display = 'block';
    });
    
    //Toggle back to log in form
    backToLoginLink.addEventListener('click', function(e) {
      e.preventDefault();
      forgotContainer.style.display = 'none';
      loginContainer.style.display = 'block';
    });
    
    forgotPasswordForm.addEventListener('submit', processForgotPassword);
  });
  
function processSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const email = form.email.value.trim();
    const password = form.password.value;
  
    if (!email || !password) {
        alert('Please fill in all required fields.');
        return;
    }

    const data = {
        email: email,
        password: password
    };

    const serializedData = JSON.stringify(data);
    const fetchOptions = {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: serializedData
    };

    fetch('http://localhost:3000/log-in', fetchOptions)
        .then(onLogInResponse)
        .then(onLogInTextReady);
}

function onLogInResponse(response) {
    //Checks to see if the logging in was success or not
    const success = response.status !== 400;
    //Return an object containing both response flag and text
    return response.text().then(text => {
        return {text, success};
    });
}
  
function onLogInTextReady(result) {
    //Displays response message from server 
    let banner = document.getElementById('title-banner');
    banner.innerText = result.text;
    if (result.text == "Email not found.") { // To pause the login page from resetting and removing failed login alert so user can see it.
        alert(result.text);
    }
    banner.style.cssText = result.success ? "color: green" : "color: red";
    location.replace(result.success ? '/' : '/log-in'); // Redirect on success
}
  
function processForgotPassword(e) {
    e.preventDefault();
    const form = e.target;
    const email = form.email.value.trim();
    
    if (!email) {
        alert('Please enter your email address.');
        return;
    }
    
    const data = { email: email };
    const serializedData = JSON.stringify(data);
    const fetchOptions = {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: serializedData
    };
    
    fetch('http://localhost:3000/forgot-password', fetchOptions)
        .then(onPResetResponse)
        .then(onPResetTextReady);
}
  
function onPResetResponse(response) {
    //Checks to see if the action was successful
    const success = response.status === 200;
    //Return an object containing both response flag and text
    return response.text().then(text => {
        return {text, success};
    });
}
  
function onPResetTextReady(result) {
    //Displays response message from server 
    let banner = document.getElementById('pass-title-banner');
    banner.innerText = result.text;
    banner.style.cssText = result.success ? "color: green" : "color: red";
}
