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
    div = document.getElementById("network-condition");
    
    if (isConnected) {
        if (countdownMessageDismiss <= 0) {
            div.style.display = "none";
        }
        else
        {
            countdownMessageDismiss--;
            if (countdownMessageDismiss < 8)
            {
                div.style.display = "flex";
                div.innerHTML = `<i class="fa-solid fa-check"></i> &nbsp Back Online`;
                div.style.backgroundColor = "rgb(200, 252, 200)";
            }
        }
    }
    else
    {
        countdownMessageDismiss = 10;
        div.style.display = "flex";
        div.innerHTML = `<i class="fa-solid fa-circle-exclamation"></i> &nbsp No Connection`;
        div.style.backgroundColor = "rgb(252, 203, 200)";
    }
}
