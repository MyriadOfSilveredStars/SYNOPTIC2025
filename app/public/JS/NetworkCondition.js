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
    header = document.querySelector('header');
    statusEl = document.getElementById("net-status");
    if (isConnected) {
        if (countdownMessageDismiss <= 0) {
            statusEl.innerHTML = ``;
            header.style.background = 'black';
        } else {
            countdownMessageDismiss--;
            if (countdownMessageDismiss < 8) {
                statusEl.innerHTML = `<i class="fi-xnsuxl-signal-solid"></i> CONNECTED`
                header.style.background = 'green';
            }
        }
    } else {
        countdownMessageDismiss = 10;
        statusEl.innerHTML = `<i class="fi-xnpuxl-signal"></i> NOT CONNECTED`
        header.style.background = 'red';
    }
}
