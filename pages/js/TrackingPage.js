function getQueryParameter(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

// Function to fetch dustbins data from the API
function fetchDustbinsData() {
    return fetch('https://garbage-collect-backend.onrender.com/get-all-areas')
        .then(response => response.json())
        .catch(error => {
            console.error('Error fetching dustbins data:', error);
            return [];
        });
}

// Function to update the dustbin tracking UI
function updateTrackingUI(data) {
    // Find the area with the given areaId
    const area = data.find(area => area.areaId === areaId);

    if (area) {
        // Dynamically add cards based on the dustbins in the area
        let trackContainer = document.getElementById('trackContainer');
        trackContainer.innerHTML = ''; // Clear previous content

        area.dustbins.forEach((dustbin, index) => {
            // Create a card element
            let card = document.createElement('div');
            card.className = 'card';

            // Create status elements
            let statusContainer = document.createElement('div');
            statusContainer.className = 'status';

            let arrivedStatus = document.createElement('p');
            arrivedStatus.className = 'arrived';

            if (dustbin.isVisited) {
                arrivedStatus.textContent = `Arrived at ${new Date(dustbin.visitedTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}`;



            } else {
                arrivedStatus.textContent = 'Not Arrived Yet';
            }

            statusContainer.appendChild(arrivedStatus);

            // Create circle element
            let circle = document.createElement('div');
            circle.className = 'circle';
            circle.style.backgroundColor = dustbin.isVisited ? '#4CAF50' : 'rgb(161, 161, 161)';

            // Append status and circle elements to the card
            card.appendChild(statusContainer);
            card.appendChild(circle);

            // Append the card to the track container
            trackContainer.appendChild(card);

            // Log the dustbin coordinates and isVisited status
            console.log(`Dustbin ${index + 1} Coordinates:`, dustbin.coordinates);
            console.log(`Dustbin ${index + 1} isVisited:`, dustbin.isVisited);
        });

    } else {
        console.error('Area not found with areaId:', areaId);
    }
}

// Get areaId from the URL
const areaId = getQueryParameter('areaId');
const vehicleId = getQueryParameter('vehicleNo');

// Fetch the initial dustbins data
fetchDustbinsData()
    .then(data => {
        updateTrackingUI(data);
    })
    .catch(error => console.error('Error fetching data:', error));

// Set up interval to fetch data every 1 second
setInterval(() => {
    fetchDustbinsData()
        .then(data => {
            updateTrackingUI(data);
        })
        .catch(error => console.error('Error fetching data:', error));
}, 1000);

window.onload = function () {

    // Fetch and update middle coordinates on map
    fetchMiddleCoordinates(areaId)
        .then(coordinates => {
            updateMiddleCoordinatesMap(coordinates);
        })
        .catch(error => console.error('Error fetching middle coordinates:', error));
};


// Replace YOUR_BING_MAPS_API_KEY with your actual Bing Maps API key
const apiKey = 'Akg60X7E388oEBNDe_wQNZMX_PmOSpXoWdurv6g5MaTx-R3keu55Rii_5-3UiG0A';

// Function to update the pushpin on the map
const updateMap = () => {
    // Fetch data from the provided API
    fetch(`https://garbage-collect-backend.onrender.com/get/${vehicleId}`)
        .then(response => response.json())
        .then(data => {
            // Get the map element
            const mapElement = document.getElementById('map');

            // Check if the map element exists
            if (mapElement) {
                // Initialize the map if it doesn't exist
                if (!mapElement.map) {
                    mapElement.map = new Microsoft.Maps.Map(mapElement, {
                        credentials: apiKey,
                        center: new Microsoft.Maps.Location(data.latitude, data.longitude),
                        zoom: 20
                    });

                    // Create a new pushpin based on the API response
                    mapElement.vehiclePushpin = new Microsoft.Maps.Pushpin(new Microsoft.Maps.Location(data.latitude, data.longitude));
                    mapElement.map.entities.push(mapElement.vehiclePushpin);
                } else {
                    // Update the existing map's center
                    mapElement.map.setView({
                        center: new Microsoft.Maps.Location(data.latitude, data.longitude)
                    });

                    // Update the vehicle pushpin location
                    mapElement.vehiclePushpin.setLocation(new Microsoft.Maps.Location(data.latitude, data.longitude));
                }

                console.log("Map Updated");
            }
        })
        .catch(error => {
            console.error('Error fetching data:', error);
        });
};

// Fetch and update the data every second
// setInterval(updateMap, 1000);

// Function to fetch middle coordinates from the API
function fetchMiddleCoordinates(areaId) {
    return fetch(`https://garbage-collect-backend.onrender.com/get-all-dustbins-coords/${areaId}`)
        .then(response => response.json())
        .catch(error => {
            console.error('Error fetching middle coordinates:', error);
            return [];
        });
}

const updateMiddleCoordinatesMap = (coordinates, vehicleData) => {
    // Get the map element
    const mapElement = document.getElementById('map');

    // Check if the map element and Bing Maps API are fully loaded
    if (mapElement && Microsoft && Microsoft.Maps) {
        // Initialize the map if it doesn't exist
        if (!mapElement.map) {
            mapElement.map = new Microsoft.Maps.Map(mapElement, {
                credentials: apiKey,
                center: new Microsoft.Maps.Location(coordinates[0].middleCoordinates.latitude, coordinates[0].middleCoordinates.longitude),
                zoom: 15
            });
        }

        // Convert entities to an array
        const entitiesArray = Array.from(mapElement.map.entities);

        // Clear existing pushpins only if it's the first update
        if (!entitiesArray.length) {
            // Add red pushpins for each middle coordinate
            coordinates.forEach(coordinate => {
                const pushpin = new Microsoft.Maps.Pushpin(new Microsoft.Maps.Location(coordinate.middleCoordinates.latitude, coordinate.middleCoordinates.longitude), {
                    color: 'red'
                });
                mapElement.map.entities.push(pushpin);
            });
        }

        // Create or update the vehicle pushpin based on the API response
        const vehicleLocation = new Microsoft.Maps.Location(vehicleData.latitude, vehicleData.longitude);
        let vehiclePushpin;

        entitiesArray.forEach(entity => {
            if (entity instanceof Microsoft.Maps.Pushpin) {
                vehiclePushpin = entity;
            }
        });

        if (!vehiclePushpin) {
            vehiclePushpin = new Microsoft.Maps.Pushpin(vehicleLocation);
            mapElement.map.entities.push(vehiclePushpin);
        } else {
            vehiclePushpin.setLocation(vehicleLocation);
        }

        console.log("Middle Coordinates Map Updated");
    }
};


// Fetch and update middle coordinates on map along with vehicle data
function updateMapAndMiddleCoordinates() {
    fetch(`https://garbage-collect-backend.onrender.com/get/${vehicleId}`)
        .then(response => response.json())
        .then(vehicleData => {
            // Fetch middle coordinates
            return fetchMiddleCoordinates(areaId)
                .then(coordinates => {
                    updateMiddleCoordinatesMap(coordinates, vehicleData);
                });
        })
        .catch(error => {
            console.error('Error fetching data:', error);
        });
}

// Fetch and update the data every second
setInterval(updateMapAndMiddleCoordinates, 1000);

// Initial update
updateMapAndMiddleCoordinates();


// Fetch and update middle coordinates on map
fetchMiddleCoordinates(areaId)
    .then(coordinates => {
        updateMiddleCoordinatesMap(coordinates);
    })
    .catch(error => console.error('Error fetching middle coordinates:', error));
