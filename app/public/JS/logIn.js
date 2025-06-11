document.addEventListener("DOMContentLoaded", function () {
    const loginForm = document.getElementById("log-in-form");
    const forgotPasswordLink = document.getElementById("forgot-link");
    const backToLoginLink = document.getElementById("return-btn");
    const forgotPasswordForm = document.getElementById("reset-form");
    const loginContainer = document.getElementById("login-container");
    const forgotContainer = document.getElementById("reset-container");

    loginForm.addEventListener("submit", processSubmit);

    //Toggle to forgot password form
    forgotPasswordLink.addEventListener("click", function (e) {
        e.preventDefault();
        loginContainer.classList.add("hidden");
        forgotContainer.classList.remove("hidden");
    });

    //Toggle back to log in form
    backToLoginLink.addEventListener("click", function (e) {
        e.preventDefault();
        forgotContainer.classList.add("hidden");
        loginContainer.classList.remove("hidden");
    });

    forgotPasswordForm.addEventListener("submit", processForgotPassword);
});

function processSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const email = form.email.value.trim();
    const password = form.password.value;

    if (!email || !password) {
        alert("Please fill in all required fields.");
        return;
    }

    const data = {
        email: email,
        password: password,
    };

    const serializedData = JSON.stringify(data);
    const fetchOptions = {
        method: "POST",
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
        },
        body: serializedData,
    };

    fetch("/log-in", fetchOptions).then(onLogInResponse).then(onLogInTextReady);
}

function onLogInResponse(response) {
    //Checks to see if the logging in was success or not
    const success = response.status !== 400;
    //Return an object containing both response flag and text
    return response.text().then((text) => {
        return { text, success };
    });
}

function onLogInTextReady(result) {
    //Displays response message from server
    if (result.success) {
        location.replace(result.success ? "/account" : "/log-in"); // Redirect on success
    } else {
        let banner = document.getElementById("title-banner");
        banner.innerText = result.text;
        banner.style.cssText = result.success ? "color: green" : "color: red";
    }
}

function processForgotPassword(e) {
    e.preventDefault();
    const form = e.target;
    const email = form.email.value.trim();

    if (!email) {
        alert("Please enter your email address.");
        return;
    }

    const data = { email: email };
    const serializedData = JSON.stringify(data);
    const fetchOptions = {
        method: "POST",
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
        },
        body: serializedData,
    };

    fetch("/forgot-password", fetchOptions)
        .then(onPResetResponse)
        .then(onPResetTextReady);
}

function onPResetResponse(response) {
    //Checks to see if the action was successful
    const success = response.status === 200;
    //Return an object containing both response flag and text
    return response.text().then((text) => {
        return { text, success };
    });
}

function onPResetTextReady(result) {
    //Displays response message from server
    let banner = document.getElementById("pass-title-banner");
    banner.innerText = result.text;
    banner.style.cssText = result.success ? "color: green" : "color: red";
}
