

// EDITABLE VARIABLES
const backendUrl = "http://192.168.0.212:3000/entries";
const updateIntervalSec = 60;
// ==================

var tempChart;
var humChart;

document.addEventListener('DOMContentLoaded', async function () {
  await refresh();
  await updateGraph();

  document.getElementById("refreshButton").addEventListener('click', refresh);
  document.getElementById("refreshButton").addEventListener('click', updateGraph);

  setInterval(refresh, updateIntervalSec * 1000);
  setInterval(updateGraph, updateIntervalSec * 1000);
});


async function refresh() {
  const response = await fetch(backendUrl);
  const entries = await response.json();
  const uiList = document.getElementById("testList");

  uiList.innerHTML = "";
  entries.reverse().forEach(entry => {
    const listItem = document.createElement('li');
    try {
      var date = new Date(entry.time * 1000);

      // Hours part from the timestamp
      var hours = date.getHours();

      // Minutes part from the timestamp
      var minutes = "0" + date.getMinutes();

      // Seconds part from the timestamp
      var seconds = "0" + date.getSeconds();

      // Will display time in 10:30:23 format
      var formattedTime = hours + ':' + minutes.substr(-2) + ':' + seconds.substr(-2);

      listItem.textContent = `time: ${formattedTime} temp: ${entry.temperature} humidity: ${entry.humidity} perceived temperature: ${entry.perceived_temperature}`;
    } catch (e) {
      console.log("Skipping entry");
    }
    uiList.appendChild(listItem);
  });
}

async function updateGraph() {
  const response = await fetch(backendUrl);
  const entries = await response.json();

  const time = entries.map(entry => entry.time);
  const temperature = entries.map(entry => entry.temperature);
  const humidity = entries.map(entry => entry.humidity);
  const perceived_temperature = entries.map(entry => entry.perceived_temperature);

  if (tempChart) {
    tempChart.data.labels = time;
    tempChart.data.datasets[0].data = temperature;
    tempChart.data.datasets[1].data = perceived_temperature;
    tempChart.update();
  } else {
    const ctx = document.getElementById('temperatureChart').getContext('2d');

    tempChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: time,
        datasets: [
          {
            label: 'Temperature',
            data: temperature,
            borderColor: 'rgba(75, 192, 192, 1)',
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            fill: false
          },
          {
            label: 'Perceived Temperature',
            data: perceived_temperature,
            borderColor: 'rgba(153, 102, 255, 1)',
            backgroundColor: 'rgba(153, 102, 255, 0.2)',
            fill: false
          }
        ]
      },
      options: {
        responsive: true,
        scales: {
          x: {
            title: {
              display: true,
              text: 'Time'
            }
          },
          y: {
            title: {
              display: true,
              text: 'Value'
            }
          }
        }
      }
    });
  }

  if (humChart) {
    humChart.data.labels = time;
    humChart.data.datasets[0] = humidity;
  } else {
    const ctx = document.getElementById('humidityChart').getContext('2d');

    humChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: time,
        datasets: [
          {
            label: 'Humidity',
            data: humidity,
            borderColor: 'rgba(74, 191, 93, 1)',
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            fill: false
          }
        ]
      },
      options: {
        responsive: true,
        scales: {
          x: {
            title: {
              display: true,
              text: 'Time'
            }
          },
          y: {
            title: {
              display: true,
              text: 'Value'
            }
          }
        }
      }
    });
  }
}
