document.addEventListener('DOMContentLoaded', function() {
    const resetForm = document.getElementById('resetPassForm');
    resetForm.addEventListener('submit', processSubmit);
});
  
//Gets OTC from url and auto fills form
const urlParam = new URLSearchParams(window.location.search);
const myParam = urlParam.get('code');
document.getElementById('uniqueCode').value = myParam;

function processSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const uniqueCode = form.uniqueCode.value;
    const newPassword = form.newPassword.value;
    const confirmPassword = form.confirmPassword.value;
  
    if (!uniqueCode || !newPassword || !confirmPassword) {
        alert('Please fill in all required fields.');
        return;
    }

    if (newPassword !== confirmPassword) {
        alert('Passwords do not match. Please try again.');
        return;
    }

    const data = {
        uniqueCode: uniqueCode,
        newPassword: newPassword
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

    fetch('/resetPassword', fetchOptions)
        .then(onLogInResponse)
        .then(onLogInTextReady);
}

function onLogInResponse(response) {
    //Checks to see if the logging in was success or not
    const success = response.status === 200;
    //Return an object containing both response flag and text
    return response.text().then(text => {
        return {text, success};
    });
}
  
function onLogInTextReady(result) {
    //Displays response message from server 
    let banner = document.getElementById('reset-title-banner');
    banner.innerText = result.text;
    banner.style.cssText = result.success ? "color: green" : "color: red";

    // !! This line needs logic to wait a few seconds before redirecting
    //location.replace(result.success ? '/' : '/log-in'); // Redirect on success
}