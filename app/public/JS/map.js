async function initMap()
{
	// Request needed libraries.
	const { Map } = await google.maps.importLibrary("maps");

	// Options for the map
	var mapOptions = {
		center: { lat: -26.193554014913836, lng: 28.069132270603006 },
		zoom: 11,// Initial zoom
		minZoom: 10,// Min zoom
		maxZoom: 9999,// Max zoom
		streetViewControl: false,// Removes the street view option (no street view anyway)
	};

	map = new Map(document.getElementById("map"), mapOptions);


	neBoundPoint = new google.maps.LatLng(-26.1, 28.2);
	swBoundPoint = new google.maps.LatLng(-26.3, 27.9);
	allowedRegion = new google.maps.LatLngBounds(swBoundPoint, neBoundPoint);

	//visualise the allowed region
	var Rectangle = new google.maps.Rectangle({
		bounds: allowedRegion,
		map: map,
		strokeColor: '#FF0000',
		strokeOpacity: 1,
		strokeWeight: 4,
		fillColor: '#000000',
		fillOpacity: 0,
	});

	//the code here is to enforce the allowed region
	google.maps.event.addListener(map, 'drag', MoveMapToAllowedRegion); //drag map
	google.maps.event.addListener(map, 'zoom_changed', MoveMapToAllowedRegion); //zoom map

	function MoveMapToAllowedRegion()
	{
		// If the current map location is outside of allowed region
		if (!allowedRegion.contains(map.getCenter()))
		{
			// Move the map back inside the allowed boundary
			map.panTo(allowedRegion.getCenter());
		}
	}
}
