async function initMap() //called by google maps API once loaded
{
	//temporary id for markers, should be replaced with backend id
	var tempID = 2;

	// Local array of markers (will have DB markers loaded initially, then any new markers pushed onto it if added)
	var markersLocal = [];

	//get libraries
	const { Map } = await google.maps.importLibrary("maps");
	const { AdvancedMarkerElement } = await google.maps.importLibrary("marker");

	//create map
	map = new Map(document.getElementById("map"), 
	{
		center: { lat: -26.193554014913836, lng: 28.069132270603006 },
		zoom: 12,// Initial zoom
		minZoom: 10,// Min zoom
		maxZoom: 9999,// Max zoom
		streetViewControl: false,
		mapId: "53ec86221c5b181adc2e8fe0"
	});

	//4 edges of allowed region
	latN = -26.1; //north latitude
	latS = -26.3; //south latitude
	lngE = 28.2; //east longitude
	lngW = 27.9; //west longitude
	
	//create black rectangles to cover non-allowed region
	RectangleIfy(0, 179, latN, -179);   //N, NE, NW
	RectangleIfy(latS, 179, -89, -179); //S, SE, SW
	RectangleIfy(latN, 179, latS, lngE);//E
	RectangleIfy(latN, lngW, latS, 179);//W

	//create region that is allowed
	neAllowedBoundary = new google.maps.LatLng(latN, lngE);
	swAllowedBoundary = new google.maps.LatLng(latS, lngW);
	allowedRegion = new google.maps.LatLngBounds(swAllowedBoundary, neAllowedBoundary);

	//allowed region rectangle, this has the click listener
	var Rectangle = new google.maps.Rectangle({
		bounds: allowedRegion,
		map: map,
		strokeColor: '#000000',
		strokeOpacity: 1,
		strokeWeight: 2,
		fillColor: '#000000',
		fillOpacity: 0,
	});

	//event listeners for enforcing allowed region
	google.maps.event.addListener(map, 'drag', MoveMapToAllowedRegion); //drag map
	google.maps.event.addListener(map, 'zoom_changed', MoveMapToAllowedRegion); //zoom map

	//finally place markers stored in DB
	placeMarkers(loadMarkers());


	//begin functions


	//create black rectangle based on ne, sw coordinates
	function RectangleIfy(ne_lat, ne_lng, sw_lat, sw_lng)
	{
		const ne = new google.maps.LatLng(ne_lat, ne_lng);
		const sw = new google.maps.LatLng(sw_lat, sw_lng);

		var region = new google.maps.LatLngBounds(sw, ne);
		new google.maps.Rectangle({
			bounds: region,
			map: map,
			fillColor: '#000000',
			fillOpacity: 0.8,
			strokeOpacity: 0
		});
	}

	//check and if needed move map back to allowed region rectangle
	function MoveMapToAllowedRegion()
	{
		// If the current map center is outside of allowed region
		if (!allowedRegion.contains(map.getCenter()))
		{
			// Move the map back inside the allowed boundary
			map.panTo(allowedRegion.getCenter());
		}
	}

	//load markers from DB, for now we used temp data
	function loadMarkers()
	{
		//TO DO fetch markers from DB/backend
		// for now well use this:
		markersLocal.push({
				"id": "0",
				"position":
				{
					"lat": -26.20818987447669,
					"lng": 28.03096522520447
				}
			}
		);

		markersLocal.push({
				"id": "1",
				"position":
				{
					"lat": -26.189536852345,
					"lng": 28.125304702770286
				}
			}
		);

		return markersLocal;
	}

	//called by clicking in rectangle
	function PlaceNewMarker(e)
	{
		// Retrieve coordinates of selected point
		const center = map.getCenter();
		const lat = center.lat();
		const lng = center.lng();

		// Check if the selected point already exists within the array of markers
		if (markersLocal.some(marker => marker.position.lat == lat && marker.position.lng == lng)) {
			alert("A marker already exists at this position.");
			return; // Do not place the marker if it already exists
		}

		const params = {
			"id": tempID++, // TODO we need unique id from backend/DB
			"position":
			{
				"lat": center.lat(),
				"lng": center.lng()
			}
		}
		PlaceMarker(params);//gets the id and places it
		markersLocal.push(params); // Add new marker to the local array of markers
	}

	//for each existing marker place it
	function placeMarkers(markersData)
	{
		for (let i = 0; i < markersData.length; i++)
		{
			PlaceMarker(markersData[i]);
		}
	}

	//place existing marker on map
	function PlaceMarker(markerData)
	{
		const markerElement = new AdvancedMarkerElement({
			position: markerData.position,
			map: map,
			content: MakeMarkerContent(markerData),
			title: "Marker " + markerData.id
		});
		markerElement.addListener("gmp-click", () => MarkerClicked(markerElement, markerData));
	}

	//generate the html for marker
	function MakeMarkerContent(markerDataIn)
	{
		const markerDiv = document.createElement("div");

		markerDiv.classList.add("markerDiv");
		markerDiv.style.backgroundColor = "white";
		markerDiv.innerHTML = `<p> Marker ID: ${markerDataIn.id}</p>`
		return markerDiv;
	}

	//called by event listener, takes the marker element 
	function MarkerClicked(markerElementIn, MarkerDataIn)
	{
		console.log("Marker clicked: ", MarkerDataIn.id);
		if (markerElementIn.content.classList.contains("expand"))
		{
			markerElementIn.content.classList.remove("expand");
			markerElementIn.zIndex = 0;
		}
		else
		{
			markerElementIn.content.classList.add("expand");
			markerElementIn.zIndex = 999; //front
		}
	}

	// When the make new marker button is pressed, the PlaceNewMarker function above is called.
	const makeNewMarkerButton = document.getElementById("makeNewMarkerButton");
	makeNewMarkerButton.addEventListener('click', PlaceNewMarker, false);
	
}
