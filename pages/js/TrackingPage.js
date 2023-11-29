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

// Get areaId from the URL
const areaId = getQueryParameter('areaId');

// Fetch dustbins data from the API
fetchDustbinsData()
    .then(data => {
        // Find the area with the given areaId
        const area = data.find(area => area.areaId === areaId);

        if (area) {
            // Dynamically add cards based on the dustbins in the area
            let trackContainer = document.getElementById('trackContainer');

            area.dustbins.forEach((dustbin, index) => {
                // Create a card element
                let card = document.createElement('div');
                card.className = 'card';

                // Create status elements
                let statusContainer = document.createElement('div');
                statusContainer.className = 'status';

                let arrivedStatus = document.createElement('span');
                arrivedStatus.className = 'arrived';
                arrivedStatus.textContent = dustbin.isVisited ? 'Arrived' : 'Not Arrived Yet';

                statusContainer.appendChild(arrivedStatus);

                // Create circle element
                let circle = document.createElement('div');
                circle.className = 'circle';
                circle.style.backgroundColor = dustbin.isVisited ? 'green' : 'gray';

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
    })
    .catch(error => console.error('Error fetching data:', error));

