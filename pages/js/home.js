// Fetch areaCount value from the provided API
fetch('https://garbage-collect-backend.onrender.com/get-all-assigned-work')
    .then(response => response.json())
    .then(data => {
        let areaCount = data.length; // Use the length of the data array as areaCount

        let profilesSection = document.getElementById('profilesSection');

        // Fetch driver data from the second API
        fetch('https://garbage-collect-backend.onrender.com/get-driver')
            .then(response => response.json())
            .then(driverData => {
                // Fetch area data from the third API
                fetch('https://garbage-collect-backend.onrender.com/get-all-areas')
                    .then(response => response.json())
                    .then(areaData => {
                        for (let i = 0; i < areaCount; i++) {
                            // Create a new driver section
                            let driverSection = document.createElement('section');
                            driverSection.classList.add('drivers');

                            // Find the corresponding driver data using driverId
                            let correspondingDriver = driverData.find(driver => driver.driverId === data[i].driverId);

                            // Find the corresponding area data using areaId
                            let correspondingArea = areaData.find(area => area.areaId === data[i].areaId);

                            if (correspondingDriver && correspondingArea) {
                                // Create an image element
                                let imgElement = document.createElement('img');
                                imgElement.src = correspondingDriver.image;
                                imgElement.alt = '';
                                imgElement.id = 'profile-photo';

                                // Create a div for driver information
                                let driverInfoDiv = document.createElement('div');
                                driverInfoDiv.classList.add('driver-info');

                                // Create paragraphs for driver information
                                let p1 = document.createElement('p');
                                p1.textContent = `No ${data[i].vehicleId}`;

                                let p2 = document.createElement('p');
                                p2.textContent = `Driver: ${correspondingDriver.name}`;

                                let p3 = document.createElement('p');
                                p3.textContent = `Area: ${correspondingArea.name}`;

                                // Append paragraphs to driver info div
                                driverInfoDiv.appendChild(p1);
                                driverInfoDiv.appendChild(p2);
                                driverInfoDiv.appendChild(p3);

                                // Create a button element
                                let showBtn = document.createElement('button');
                                showBtn.type = 'submit';
                                showBtn.textContent = 'Track';
                                showBtn.id = 'show-btn';

                                // Add click event listener to the submit button
                                showBtn.addEventListener('click', function () {
                                    // Log and send data to snd.html
                                    console.log('Driver ID:', correspondingDriver.driverId);
                                    console.log('Area ID:', data[i].areaId);
                                    console.log('Vehicle No:', data[i].vehicleId);

                                    // Create an object with the data
                                    let sendData = {
                                        driverId: correspondingDriver.driverId,
                                        areaId: data[i].areaId,
                                        vehicleNo: data[i].vehicleId
                                    };

                                    // Convert the object to a query string
                                    let queryString = Object.entries(sendData).map(([key, value]) => `${key}=${value}`).join('&');

                                    // Redirect to snd.html with the data
                                    window.location.href = `/pages/TrackingPage.html?${queryString}`;
                                });

                                // Append elements to the driver section
                                driverSection.appendChild(imgElement);
                                driverSection.appendChild(driverInfoDiv);
                                driverSection.appendChild(showBtn);

                                // Append the driver section to the profiles section
                                profilesSection.appendChild(driverSection);
                            }
                        }
                    })
                    .catch(error => console.error('Error fetching area data:', error));
            })
            .catch(error => console.error('Error fetching driver data:', error));
    })
    .catch(error => console.error('Error fetching data:', error));


// Dynamically add notifications based on countNoti
function fetchAndDisplayNotifications() {
    // Fetch the first API
    fetch('https://garbage-collect-backend.onrender.com/get-all-areas')
        .then(response => response.json())
        .then(areaData => {
            // Fetch the second API
            return fetch('https://garbage-collect-backend.onrender.com/get-all-assigned-work')
                .then(response => response.json())
                .then(assignedWorkData => {
                    let countNoti = 0;
                    let notificationSection = document.getElementById('notificationSection');

                    // Clear existing notifications
                    notificationSection.innerHTML = '';

                    // Loop through each area
                    areaData.forEach(area => {
                        // Loop through each dustbin in the area
                        area.dustbins.forEach((dustbin, index) => {
                            // Check if isVisited is true
                            if (dustbin.isVisited) {
                                // Find the corresponding assigned work for the area
                                const assignedWork = assignedWorkData.find(assignedWorkData => assignedWorkData.areaId == area.areaId);
                                // Create a new notifications section
                                let notificationsSection = document.createElement('section');
                                notificationsSection.classList.add('notifications');

                                // Create a notification element
                                let notificationElement = document.createElement('h3');
                                notificationElement.classList.add('noti');
                                notificationElement.textContent = `On ${area.name} area, Dustbin no: ${index + 1} visited by Vehicle ${assignedWork ? assignedWork.vehicleId : 'N/A'}`;
                                // console.log(assignedWork.vehicleId)
                                // Append notification element to notifications section
                                notificationsSection.appendChild(notificationElement);

                                // Append notifications section to notification section
                                notificationSection.appendChild(notificationsSection);

                                countNoti++;
                            }
                        });
                    });

                    console.log('Count of visited dustbins:', countNoti);
                });
        })
        .catch(error => console.error('Error fetching data:', error));
}

// Call the function initially
fetchAndDisplayNotifications();

// Set interval to fetch and display notifications every 2 seconds
setInterval(fetchAndDisplayNotifications, 2000);
