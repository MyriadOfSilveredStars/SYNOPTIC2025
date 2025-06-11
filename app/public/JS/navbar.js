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
    if (getSessionToken()) {
        //Add signout event
        document.querySelector("#nav-account i").classList.add("fa-user-check");
    } else {
        document.querySelector("#nav-account i").classList.add("fa-user-xmark");
    }
}

document.addEventListener("DOMContentLoaded", renderNav);
