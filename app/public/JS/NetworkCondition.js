window.onload = () => {
	function TestConnection() //inspiration from https://www.codingnepalweb.com/detect-internet-connection-javascript/
	{
		var request = new XMLHttpRequest();
		request.open("GET", "https://jsonplaceholder.typicode.com/posts", true);
		request.onload = () => {
			if (request.status >= 200 && request.status < 300) {//online
				ConnectionStatusSet(true);
			}
		}
		request.onerror = () => {
			ConnectionStatusSet(false);
		}
		request.send();
		
	}

	setInterval(() => {
		TestConnection();
	}, 500);
}


function ConnectionStatusSet(isConnected)
{
	document.getElementById("network-condition").style.display = isConnected ? "none" : "flex";
}



