var countdownMessageDismiss = 0;

window.onload = () => {
    function TestConnection() {
        //inspiration from https://www.codingnepalweb.com/detect-internet-connection-javascript/
        var request = new XMLHttpRequest();
        request.open("GET", "https://jsonplaceholder.typicode.com/posts", true);
        request.onload = () => {
            if (request.status >= 200 && request.status < 300) {
                //online
                ConnectionStatusSet(true);
            }
        };
        request.onerror = () => {
            ConnectionStatusSet(false);
        };
        request.send();
    }

    setInterval(() => {
        TestConnection();
    }, 500);
};

function ConnectionStatusSet(isConnected) {
    good = document.getElementById("net-good");
    bad = document.getElementById("net-bad");

    if (isConnected) {
        if (countdownMessageDismiss <= 0) {
            good.style.opacity = 0;
            bad.style.opacity = 0;
        } else {
            countdownMessageDismiss--;
            if (countdownMessageDismiss < 8) {
                good.style.opacity = 1;
                bad.style.opacity = 0;
            }
        }
    } else {
        countdownMessageDismiss = 10;
        bad.style.opacity = 1;
        good.style.opacity = 0;
    }
}
