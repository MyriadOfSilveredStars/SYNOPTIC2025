async function initMap()
{
	// Request needed libraries.
	const { Map } = await google.maps.importLibrary("maps");
	const { AdvancedMarkerElement } = await google.maps.importLibrary("marker");

	// Options for the map
	var mapOptions = {
		center: { lat: -26.193554014913836, lng: 28.069132270603006 },
		zoom: 12,// Initial zoom
		minZoom: 10,// Min zoom
		maxZoom: 9999,// Max zoom
		streetViewControl: false,
		mapId: "53ec86221c5b181adc2e8fe0"
	};

	map = new Map(document.getElementById("map"), mapOptions);


	latN = -26.1; //north latitude
	latS = -26.3; //south latitude
	lngE = 28.2; //east longitude
	lngW = 27.9; //west longitude
	
	
	RectangleIfy(0, 179, latN, -179);   //N, NE, NW
	RectangleIfy(latS, 179, -89, -179); //S, SE, SW
	RectangleIfy(latN, 179, latS, lngE);//E
	RectangleIfy(latN, lngW, latS, 179);//W


	function RectangleIfy(ne_lat, ne_lng, sw_lat, sw_lng)
	{
		const ne = new google.maps.LatLng(ne_lat, ne_lng);
		const sw = new google.maps.LatLng(sw_lat, sw_lng);

		var region = new google.maps.LatLngBounds(sw, ne );
		new google.maps.Rectangle({
			bounds: region,
			map: map,
			fillColor: '#000000',
			fillOpacity: 0.8,
			strokeOpacity: 0
		});
	}


	neBoundPoint = new google.maps.LatLng(latN, lngE);
	swBoundPoint = new google.maps.LatLng(latS, lngW);
	allowedRegion = new google.maps.LatLngBounds(swBoundPoint, neBoundPoint);

	//visualise the allowed region
	var Rectangle = new google.maps.Rectangle({
		bounds: allowedRegion,
		map: map,
		strokeColor: '#000000',
		strokeOpacity: 1,
		strokeWeight: 2,
		fillColor: '#000000',
		fillOpacity: 0,
	});

	//the code here is to enforce the allowed region
	google.maps.event.addListener(map, 'drag', MoveMapToAllowedRegion); //drag map
	google.maps.event.addListener(map, 'zoom_changed', MoveMapToAllowedRegion); //zoom map


	google.maps.event.addListener(Rectangle, 'click', PlaceNewMarker);
	placeMarkers(loadMarkers());


	function MoveMapToAllowedRegion()
	{
		// If the current map location is outside of allowed region
		if (!allowedRegion.contains(map.getCenter()))
		{
			// Move the map back inside the allowed boundary
			map.panTo(allowedRegion.getCenter());
		}
	}

	function loadMarkers()
	{
		//fetch markers from DB/backend, for now well use this:
		const markers =
			[
				{
					"id": "0",
					"position":
					{
						"lat": -26.20818987447669,
						"lng": 28.03096522520447
					}
				}
			]


		return markers
	}

	function PlaceNewMarker(e)
	{
		const params = 
		{
			"id": 123, //we need unique id
			"position":
			{
				"lat": e.latLng.lat(),
				"lng": e.latLng.lng()
			}
		}
		PlaceMarker(params);

	}



	function placeMarkers(markersData)
	{
		for (let i = 0; i < markersData.length; i++)
		{
			PlaceMarker(markersData[i]);
		}
	}
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



	function MakeMarkerContent(markerDataIn)
	{
		const markerDiv = document.createElement("div");

		markerDiv.classList.add("markerDiv");
		markerDiv.style.backgroundColor = "white";
		markerDiv.innerHTML = `<p> Marker ID: ${markerDataIn.id}</p>`
		return markerDiv;
	}

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
}
