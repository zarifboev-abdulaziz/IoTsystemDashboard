// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyA1gYq4QOEl3RiqJBYvdX8ffN0eLKxUTPk",
    authDomain: "smart-garden-system-54280.firebaseapp.com",
    databaseURL: "https://smart-garden-system-54280-default-rtdb.firebaseio.com",
    projectId: "smart-garden-system-54280",
    storageBucket: "smart-garden-system-54280.firebasestorage.app",
    messagingSenderId: "420246867437",
    appId: "1:420246867437:web:12509f25a67a02331b2be4"
};

  firebase.initializeApp(firebaseConfig);
  
  // Initialize Firebase database reference
  const db = firebase.database();
  
  // Function to parse CSV string into an array of values
  function parseCSV(csvString) {
    return csvString.split(",").map(value => parseFloat(value.trim()));
  }
  
  // Function to convert array to CSV string
  function arrayToCSV(arr) {
    return arr.join(",");
  }
  
  // Function to update sensor data on the UI
  function updateSensorData(csvData) {
    const [brightness, waterlevel, temperature, humidity] = parseCSV(csvData);
    document.getElementById("brightness").innerText = brightness;
    document.getElementById("water").innerText = waterlevel;
    document.getElementById("temperature").innerText = temperature;
    document.getElementById("humidity").innerText = humidity;
  
    // Display alerts based on thresholds
    const alerts = document.getElementById("alerts");
    alerts.innerHTML = '';  // Clear previous alerts
    if (brightness < 30) {  // Example threshold
      alerts.innerHTML += `<div class="alert">Brightness Level is Low!</div>`;
    }
    if (waterlevel < 30) {  // Example threshold
      alerts.innerHTML += `<div class="alert">Water Level is Low!</div>`;
    }
  }
  
  // Function to update actuator states in Firebase
  function updateActuatorStates(newStates) {
    const csvData = arrayToCSV(newStates);
    db.ref("actuatorStates").set(csvData);
  }
  
  // Function to toggle actuator state
  function toggleActuator(actuatorIndex) {
    db.ref("actuatorStates").once("value", snapshot => {
      const csvData = snapshot.val();
      let states = parseCSV(csvData);
  
      // Toggle the specific actuator's state (0 -> 1, 1 -> 0)
      states[actuatorIndex] = states[actuatorIndex] === 1 ? 0 : 1;
  
      // Update Firebase with the new states
      updateActuatorStates(states);
  
      // Update the button states immediately on the UI
      updateButtonStates(states);
    });
  }
  
  // Function to update button UI based on state
  function updateButtonStates(states) {
    const [buzzerState, ledState] = states;  // Order is now buzzer first, then LED
    updateButtonState("buzzerButton", buzzerState);
    updateButtonState("ledButton", ledState);
  }
  
  // Helper function to update a single button's UI
  function updateButtonState(buttonId, state) {
    const button = document.getElementById(buttonId);
    if (state === 1) {
      button.innerText = `${buttonId === "buzzerButton" ? "Buzzer" : "LED"}: ON`;
      button.classList.remove("off");
      button.classList.add("on");
    } else {
      button.innerText = `${buttonId === "buzzerButton" ? "Buzzer" : "LED"}: OFF`;
      button.classList.remove("on");
      button.classList.add("off");
    }
  }
  
  // Listen for real-time updates to sensor data
  db.ref("sensorData").on("value", snapshot => {
    const csvData = snapshot.val();
    updateSensorData(csvData);
  });
  
  // Listen for real-time updates to actuator states
  db.ref("actuatorStates").on("value", snapshot => {
    const csvData = snapshot.val();
    const states = parseCSV(csvData);
    updateButtonStates(states);
  });
  
  // Event listeners for actuator buttons
  document.getElementById("buzzerButton").addEventListener("click", () => toggleActuator(0));
  document.getElementById("ledButton").addEventListener("click", () => toggleActuator(1));
  