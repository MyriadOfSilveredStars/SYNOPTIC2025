window.onload = () => {
	function TestConnection() //inspiration from https://www.codingnepalweb.com/detect-internet-connection-javascript/
	{
		var xhr = new XMLHttpRequest();
		xhr.open("GET", "https://jsonplaceholder.typicode.com/posts", true);
		xhr.onload = () => {
			if (xhr.status >= 200 && xhr.status < 300) {//online
				console.log("good");
				ConnectionStatusSet(true);
			}
		}
		xhr.onerror = () => {
			//console.error("Network error occurred.");
			ConnectionStatusSet(false);
		}
		xhr.send();
		
	}

	setInterval(() => {
		TestConnection();
	}, 500);
}


function ConnectionStatusSet(isConnected)
{
	document.getElementById("network-condition").style.display = isConnected ? "none" : "flex";
}



