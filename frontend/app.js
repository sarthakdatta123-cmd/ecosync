const API = "http://localhost:3000";

// Chart variables
let chart;
let labels = [];
let tempData = [];
let soilData = [];

// Create chart
function createChart() {
  const ctx = document.getElementById("chart").getContext("2d");

  chart = new Chart(ctx, {
    type: "line",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Temperature (°C)",
          data: tempData,
          borderWidth: 2,
          tension: 0.3
        },
        {
          label: "Soil Moisture (%)",
          data: soilData,
          borderWidth: 2,
          tension: 0.3
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          labels: {
            color: "white"
          }
        }
      },
      scales: {
        x: {
          ticks: { color: "white" }
        },
        y: {
          ticks: { color: "white" }
        }
      }
    }
  });
}

// Load sensor data + update chart
async function loadData() {
  try {
    const res = await fetch(`${API}/data`);
    const data = await res.json();

    // Update UI
    document.getElementById("temp").innerText = data.temperature + "°C";
    document.getElementById("hum").innerText = data.humidity + "%";
    document.getElementById("soil").innerText = data.soil + "%";

    // Add to chart
    const time = new Date().toLocaleTimeString();

    labels.push(time);
    tempData.push(data.temperature);
    soilData.push(data.soil);

    // Keep only last 10 points
    if (labels.length > 10) {
      labels.shift();
      tempData.shift();
      soilData.shift();
    }

    chart.update();

  } catch (err) {
    console.error("Data error:", err);
  }
}

// Load irrigation status
async function loadIrrigation() {
  try {
    const res = await fetch(`${API}/irrigation`);
    const data = await res.json();

    document.getElementById("irrigation").innerText = data.decision;

  } catch (err) {
    console.error("Irrigation error:", err);
  }
}

// Load weather
async function loadWeather() {
  try {
    const res = await fetch(`${API}/weather`);
    const data = await res.json();

    document.getElementById("weather").innerText =
      data.weather[0].main + " | " + data.main.temp + "°C";

  } catch (err) {
    console.error("Weather error:", err);
  }
}

// Simulate dry soil
async function simulate() {
  await fetch(`${API}/update`, {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({
      temperature: 30,
      humidity: 60,
      soil: 30
    })
  });
}

// Initialize everything
createChart();

// Auto refresh every 3 sec
setInterval(() => {
  loadData();
  loadIrrigation();
  loadWeather();
  loadAI();
}, 3000);

async function loadAI() {
  try {
    const res = await fetch(`${API}/ai`);
    const data = await res.json();

    document.getElementById("ai").innerText = data.content;

  } catch {
    document.getElementById("ai").innerText = "AI unavailable";
  }
}