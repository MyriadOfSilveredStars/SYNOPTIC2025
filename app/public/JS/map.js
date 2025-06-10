//var markerDiv; // wtf is this doing? global scope causing me issues grrr
async function initMap() //called by google maps API once loaded
{
	// Local array of markers (will have DB markers loaded initially, then any new markers pushed onto it if added)
	var markersLocal = [];
    var markerElements = [];

    // Hide new marker button if the user is not logged in with an account
    if (!window.isLoggedIn) {
        document.getElementById("newMarkerBtn").style.display = "none";
    }

    //get libraries
    const { Map } = await google.maps.importLibrary("maps");
    const { AdvancedMarkerElement } = await google.maps.importLibrary("marker");

    //create map
    map = new Map(document.getElementById("map"), {
        center: { lat: -26.193554014913836, lng: 28.069132270603006 },
        zoom: 15, // Initial zoom
        minZoom: 14, // Min zoom
        maxZoom: 9999, // Max zoom
        streetViewControl: false,
        gestureHandling: "greedy",
        mapId: "53ec86221c5b181adc2e8fe0",
    });

    //4 edges of allowed region
    latN = -26.1837; //north latitude
    latS = -26.2036; //south latitude
    lngE = 28.0855;  //east longitude
    lngW = 28.0588;  //west longitude

    //create black rectangles to cover non-allowed region
    RectangleIfy(0, 179, latN, -179); //N, NE, NW
    RectangleIfy(latS, 179, -89, -179); //S, SE, SW
    RectangleIfy(latN, 179, latS, lngE); //E
    RectangleIfy(latN, lngW, latS, 179); //W

    //create region that is allowed
    neAllowedBoundary = new google.maps.LatLng(latN, lngE);
    swAllowedBoundary = new google.maps.LatLng(latS, lngW);
    allowedRegion = new google.maps.LatLngBounds(
        swAllowedBoundary,
        neAllowedBoundary
    );

    //allowed region rectangle, this has the click listener
    var Rectangle = new google.maps.Rectangle({
        bounds: allowedRegion,
        map: map,
        strokeColor: "#000000",
        strokeOpacity: 1,
        strokeWeight: 2,
        fillColor: "#000000",
        fillOpacity: 0,
    });

    //event listeners for enforcing allowed region
    google.maps.event.addListener(map, "drag", MoveMapToAllowedRegion); //drag map
    google.maps.event.addListener(map, "zoom_changed", MoveMapToAllowedRegion); //zoom map

    //finally place markers stored in DB
    placeMarkers(loadMarkers());

    //begin functions

    //create black rectangle based on ne, sw coordinates
    function RectangleIfy(ne_lat, ne_lng, sw_lat, sw_lng) {
        const ne = new google.maps.LatLng(ne_lat, ne_lng);
        const sw = new google.maps.LatLng(sw_lat, sw_lng);

        var region = new google.maps.LatLngBounds(sw, ne);
        new google.maps.Rectangle({
            bounds: region,
            map: map,
            fillColor: "#000000",
            fillOpacity: 0.8,
            strokeOpacity: 0,
        });
    }

    function clearMarkers() {
        markerElements.forEach(markerElement => {
            if (markerElement.map) {
                markerElement.map = null; // Remove the marker from the map
            }
        });
        markerElements = []; // Clear the local array of markers
        markersLocal = []; // Clear the local array of markers
        console.log("Markers cleared.");
    }

    async function refreshMarkers() {
        const response = await fetch("/api/markers");
        const newMarkers = await response.json();
        clearMarkers(); //Clear existing markers
        markersLocal = newMarkers; //Update local markers array
        placeMarkers(markersLocal); //Place new markers on the map
        console.log("Markers refreshed.");
    }

    //check and if needed move map back to allowed region rectangle
    function MoveMapToAllowedRegion() {
        // If the current map center is outside of allowed region
        if (!allowedRegion.contains(map.getCenter())) {
            // Move the map back inside the allowed boundary
            map.panTo(allowedRegion.getCenter());
        }
    }

    // Load markers from backend into local array
    function loadMarkers() {
        // Test to fetch markers from backend - seems to work.
        //console.log(window.markerDataFromBackend);
        let dbMarkers = window.markerDataFromBackend;

        for (let i = 0; i < dbMarkers.length; i++) {
            markersLocal.push(dbMarkers[i]);
        }

        //console.log(markersLocal)

        return markersLocal;
    }

    // Make a new marker with the user's description
    function giveDescription(e) {
        e.preventDefault();
        // Retrieve coordinates of selected point
        const center = map.getCenter();
        const lat = center.lat();
        const lng = center.lng();

        // Check if the selected point already exists within the array of markers
        if (
            markersLocal.some(
                (marker) =>
                    marker.position.lat == lat && marker.position.lng == lng
            )
        ) {
            alert("A marker already exists at this position.");
            return; // Do not place the marker if it already exists
        }

        // Obtain current values of category and description for the new marker
        var category = document.getElementById("category").value;
        var description = document.getElementById("description").value;
        
        // Reset category and description fields to default for next marker to be placed
        document.getElementById("category").value = "";
        document.getElementById("description").value = "";

        // Parameters for new marker, but not including ID as this needs to be generated by the database, and sent back to this client.
        const params = {
            position: {
                lat: center.lat(),
                lng: center.lng(),
            },
            creator: getSessionToken(), // Get the session token for the creator
            description: description,
            category: category,
        };

        const serializedData = JSON.stringify(params);
        const fetchOptions = {
            method: "POST",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
            },
            body: serializedData,
        };

        fetch("/map", fetchOptions)
            .then(onResponse)
            .then(onReceiveNewPlacedMarker);
    }

    //called by clicking in rectangle
    function PlaceNewMarker(e) {
        document.getElementById("crosshair").classList.remove("hidden");
        document.getElementById("descForm").classList.remove("hidden");
    }

    //for each existing marker place it
    function placeMarkers(markersData) {
        //console.log(markersData)
        //for each marker in the array, place it on the map
        for (let i = 0; i < markersData.length; i++) {
            PlaceMarker(markersData[i]);
        }
    }

    //Gets cookie for markers
    function getSessionToken() {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; sessionToken=`);
        if (parts.length === 2) {
            return parts.pop().split(";").shift();
        }
        return null;
    }

    //place existing marker on map
    function PlaceMarker(markerData) {
        //function to place each individual marker, using lat and long
        const markerElement = new AdvancedMarkerElement({
            position: markerData.position,
            map: map,
            content: MakeMarkerContent(markerData, markerData),
            title: "Marker " + markerData.id,
        });
        markerData._markerElement = markerElement; // Store the reference
        markerElements.push(markerElement); // Add to the local array of markers
        markerElement.addListener("gmp-click", () =>
            MarkerClicked(markerElement, markerData)
        );
    }

    //generate the html for marker
    function MakeMarkerContent(markerDataIn, markerDataRef)
    {
        //these cannot be global! stop doing it!!
        const userUUID = getSessionToken();
        const markerDiv = document.createElement("div");

        markerDiv.classList.add("markerDiv");
        markerDiv.classList.add(markerDataIn.markerType.replaceAll(" ", "") || "Other");
        markerDiv.style.backgroundColor = "white";

        // Hide voting buttons if the user is not logged in with an account
        if (!window.isLoggedIn) {
            markerDiv.innerHTML = 
                `<p>${markerDataIn.markerType || "Other"}</p>
		        <div class="voteButtons" style="display:none">
                    <div class="scrollableDescription">
                        <p>${markerDataIn.description || "No description was provided"}</p>
                    </div>
		        </div>`;

            // stop propagation of scroll event to the map
            const scrollableDescription = markerDiv.querySelector('.scrollableDescription');
            scrollableDescription.addEventListener('wheel', (e) => {e.stopPropagation();});
            
            return markerDiv; // Skips adding vote buttons and their functionality
        }

        markerDiv.innerHTML =
            `<p>${markerDataIn.markerType || "Other"}</p>
		    <div class="voteButtons" style="display:none">
                <div class="scrollableDescription">
			        <p>${markerDataIn.description || "No description was provided"}</p>
                </div>
			    <button class="upvoteButton"><i class="fa-solid fa-thumbs-up"></i></button>
			    <span class="totalVotes" id="number">${markerDataIn.upvotes - markerDataIn.downvotes}</span>
			    <button class="downvoteButton"><i class="fa-solid fa-thumbs-down"></i></button>
		    </div>`;

        //get buttons
        const upvoteButton = markerDiv.querySelector('.upvoteButton')
        const downvoteButton = markerDiv.querySelector('.downvoteButton')
        //check if pressed by user
        if (markerDataIn.upVoterList.includes(userUUID))
        {
            upvoteButton.classList.add("pressedVote")
        } else if (markerDataIn.downVoterList.includes(userUUID))
        {
            downvoteButton.classList.add("pressedVote")
        }
        //add event listeners
        upvoteButton.addEventListener('click', (e) => HandleVote(e, markerDataIn.id, 'upvote', markerDiv))
        downvoteButton.addEventListener('click', (e) => HandleVote(e, markerDataIn.id, 'downvote', markerDiv))
        
        // stop propagation of scroll event to the map
        const scrollableDescription = markerDiv.querySelector('.scrollableDescription');
        scrollableDescription.addEventListener('wheel', (e) => {e.stopPropagation();});


        if (hasAdminOverButton(markerDataIn))
        {
            const voteButtonsDiv = markerDiv.querySelector('.voteButtons');

            //add br
            // const brElement = document.createElement("br");
            // voteButtonsDiv.appendChild(brElement);

            //Added delete button
            const deleteButton = document.createElement("button");
            deleteButton.innerHTML = `<i class="fa-solid fa-xmark"></i> Delete Marker`;
            deleteButton.disabled = hasAdminOverButton(markerDataIn) == false;
            deleteButton.onclick = () => deleteMarker(markerDataIn.id, markerDiv, markerDataRef._markerElement)

            voteButtonsDiv.appendChild(deleteButton);
        }
        return markerDiv;
    }

    function hasAdminOverButton(markerDataIn)
    {
        const userUUID = getSessionToken();
        return ((userUUID && markerDataIn.creator === userUUID) || isAdmin);
    }

    function deleteMarker(markerId, markerDiv, markerElement) {
        //Send a DELETE request to the backend to delete the marker
        fetch(`/map/${markerId}`, {
            method: "DELETE",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
            },
        })
            .then((response) => {
                if (response.ok) {
                    //Remove the marker from the map and local array, saves changes if DB hasnt refreshed yet
                    markersLocal = markersLocal.filter(
                        (marker) => marker.id !== markerId
                    );
                    markerDiv.remove(); //Remove the marker element from the DOM
                    if (markerElement) {
                        markerElement.map = null; // Remove the marker from the map
                    }
                    console.log("Marker deleted successfully!");
                } else {
                    console.error("Failed to delete marker.");
                }
            })
            .catch((error) => console.error("Error deleting marker:", error));
    }

    //called by event listener, takes the marker element
    function MarkerClicked(markerElementIn, MarkerDataIn) {
        console.log("Marker clicked: ", MarkerDataIn.id);
        const voteButtons =
            markerElementIn.content.querySelector(".voteButtons");
        if (markerElementIn.content.classList.contains("expand")) {
            markerElementIn.content.classList.remove("expand");
            markerElementIn.zIndex = 0;
            voteButtons.style.display = "none";
        } else {
            markerElementIn.content.classList.add("expand");
            markerElementIn.zIndex = 999; //front
            voteButtons.style.display = "inline";
        }
    }

    // When the make new marker button is pressed, the PlaceNewMarker function above is called.
    const newMarkerBtn = document.getElementById("newMarkerBtn");
    newMarkerBtn.addEventListener("click", PlaceNewMarker, false);
    descForm.addEventListener("submit", giveDescription);
    const cancelMarker = document.getElementById("cancel-marker-btn");
    cancelMarker.addEventListener("click", () => {
        document.getElementById("descForm").classList.add("hidden");
        document.getElementById("crosshair").classList.add("hidden");
        
    })
    //TODO: add on click cancel button hiding the form and crosshair again


    function onResponse(response) {
        //Return the JSON data
        return response.json();
    }

    //sends the vote to the server
    async function HandleVote(e, markerID, vote, markerDiv) {
        e.stopPropagation(); //prevents closing the div
        const userUUID = getSessionToken();
        console.log("voting?");

        const fetchOptions = {
            method: "POST",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
            },

            body: JSON.stringify({
                markerID: markerID,
                userID: userUUID,
            }),
        };

        fetch(`/${vote}`, fetchOptions)
            .then(onResponse)
            .then(onReceiveVoteUpdate);
    }

    // Used to place the marker that this client has just added to the database, so that it can retrieve it's unique ID from that.
    function onReceiveNewPlacedMarker(newMarkerDataFromBackend) {
        refreshMarkers(); // Refresh markers to include the new one
        console.log("New marker placed:", newMarkerDataFromBackend);
        document.getElementById("descForm").classList.add("hidden");
    }

    //logic for toggling the button appearance
    function modifyButton(button, vote) {
        if (vote > 0) {
            button.classList.add("pressedVote");
			console.log('voted!');
        } else {
            button.classList.remove("pressedVote");
        }
    }

    // Handle vote update locally once received data back from server upon pressing either upvote or downvote.
    function onReceiveVoteUpdate(voteData) {
        const advancedMarkerElement = document.querySelector(
            `gmp-advanced-marker[title="Marker ${voteData.markerID}"]`
        );
        console.log(advancedMarkerElement);
        markerDiv = advancedMarkerElement;
        const upvoteButton = markerDiv.querySelector(".upvoteButton");
        const downvoteButton = markerDiv.querySelector(".downvoteButton");
        const numbers = markerDiv.querySelector(".totalVotes");
        numbers.innerHTML =
            parseInt(numbers.innerHTML) + voteData.upvotes - voteData.downvotes;
        modifyButton(upvoteButton, voteData.upvotes);
        modifyButton(downvoteButton, voteData.downvotes);
    }
}
