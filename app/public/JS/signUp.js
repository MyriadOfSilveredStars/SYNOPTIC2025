document.addEventListener("DOMContentLoaded", function () {
    const formElement = document.getElementById("signUpForm");
    formElement.addEventListener("submit", processSubmit);
});

function processSubmit(e) {
    e.preventDefault();
    const form = e.target;

    // Gather form values
    const firstName = form.firstName.value.trim();
    const lastName = form.lastName.value.trim();
    const email = form.email.value.trim();
    const birthDate = form.birthDate.value;
    const gender = form.gender.value;
    const password = form.password.value;
    const confirmPassword = form.confirmPassword.value;

    // Check if passwords match
    if (password !== confirmPassword) {
        alert("Passwords do not match!");
        return;
    }

    // Ensure all required fields are filled
    if (
        !firstName ||
        !lastName ||
        !email ||
        !birthDate ||
        !gender ||
        !password
    ) {
        alert("Please fill in all required fields.");
        return;
    }

    //somewhere here we need to read all the emails and if the entered one already exists,
    //then tell the user to choose another

    // Build data object and serialize to JSON
    const data = {
        firstName: firstName,
        lastName: lastName,
        email: email,
        birthDate: birthDate,
        gender: gender,
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

    fetch("/sign-up", fetchOptions).then(onResponse).then(onTextReady);
}

function onResponse(response) {
    //Checks to see if the action was successful
    const success = response.status === 200;
    //Return an object containing both response flag and text
    return response.text().then((text) => {
        return { text, success };
    });
}

function onTextReady(result) {
    //Displays response message from server
    let banner = document.getElementById("title-banner");
    banner.innerText = result.text;
    banner.style.cssText = result.success ? "color: green" : "color: red";
    setTimeout(() => {
        location.replace(result.success ? "/log-in" : "/"); // Redirect on success
    }, 2000);//Wait 2 seconds before redirecting
}
