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

function renderNav() {
    const navList = document.getElementById("nav-list");
    navList.innerHTML = "";

    if (getSessionToken()) {
        //User is logged in
        navList.innerHTML = `
            <li><a href="/">Home</a></li>
            <li><a href="/map">Map</a></li>
            <li><a href="#" id="signout-link">Sign Out</a></li>
        `;
        //Add signout event
        document
            .getElementById("signout-link")
            .addEventListener("click", function (e) {
                e.preventDefault();
                clearAllCookiesAndReload();
            });
    } else {
        //Not logged in
        navList.innerHTML = `
            <li><a href="/">Home</a></li>
            <li><a href="/sign-up">Sign Up</a></li>
            <li><a href="/log-in">Log In</a></li>
        `;
    }
}

document.addEventListener("DOMContentLoaded", renderNav);
