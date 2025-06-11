function getSessionToken() {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; sessionToken=`);
    if (parts.length === 2) return parts.pop().split(";").shift();
    return null;
}

function clearAllCookiesAndReload() {
    //Updates the session token cookie to expire immediately
    document.cookie.split(";").forEach(function (c) {
        document.cookie = c
            .replace(/^ +/, "")
            .replace(
                /=.*/,
                "=;expires=" + new Date().toUTCString() + ";path=/"
            );
    });
    location.reload();
}

signUpBtn = document.getElementById("sign-up-btn");
logInBtn = document.getElementById("log-in-btn");
logOutBtn = document.getElementById("log-out-btn");
emailTitle = document.getElementById("email-header")
if (getSessionToken()) {
    signUpBtn.classList.add("hidden");
    logInBtn.classList.add("hidden");
    logOutBtn.classList.remove("hidden");
    logOutBtn.addEventListener("click", function (e) {
        e.preventDefault();
        clearAllCookiesAndReload();
    });


} else {
    logOutBtn.classList.add("hidden");
}
