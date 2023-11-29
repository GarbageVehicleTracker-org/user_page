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

function getCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}

function setCookie(name, value, days) {
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    const expires = `expires=${date.toUTCString()}`;
    document.cookie = `${name}=${value}; ${expires}; path=/`;
}

function deleteCookie(name) {
    document.cookie = name + '=; Max-Age=-99999999;';
}

function logout() {
    deleteCookie("authToken");
    window.location.href = "../index.html";
}

window.onload = function () {
    var authToken = getCookie("authToken");
    if (!authToken) {
        window.location.href = "../index.html";
    }
};

function redirectToHome() {
    window.location.href = 'home.html';
}
