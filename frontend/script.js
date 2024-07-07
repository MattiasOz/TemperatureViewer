// EDITABLE VARIABLES
const backendUrl = "http://192.168.0.212:3000/entries";
const updateIntervalSec = 60;
// ==================

const humidityColor = 'rgba(104, 221, 123, 1)';
const weekdaysMap = {0: 'Monday', 1: 'Tuesday', 2: 'Wednesday', 3: 'Thursday', 4: 'Friday', 5: 'Saturday', 6: 'Sunday'};
const monthsMap = {0: 'January', 1: 'February', 2: 'Mars', 3: 'April', 4: 'May', 5: 'June', 6: 'July', 7: 'August', 8: 'September', 9: 'October', 10: 'November', 11: 'December'};
var tempChart;
var specifier = "";

document.addEventListener('DOMContentLoaded', async function () {
  await refreshAll();

  document.getElementById("refreshButton").addEventListener('click', refreshAll);
  document.getElementById("getAllButton").addEventListener('click', setAll);
  document.getElementById("get24hButton").addEventListener('click', set24h);
  document.getElementById("get7dButton").addEventListener('click', set7d);
  document.getElementById("get30dButton").addEventListener('click', set30d);

  setInterval(refreshAll, updateIntervalSec * 1000);
});

async function setAll(){
  specifier = "";
  await refreshAll();
}

async function set24h(){
  specifier = "/24h";
  await refreshAll();
}

async function set7d(){
  specifier = "/7d";
  await refreshAll();
}

async function set30d(){
  specifier = "/30d";
  await refreshAll();
}

async function refreshAll(){
  const response = await fetch(backendUrl + specifier);
  const entries = await response.json();

  updateGraph(entries);
  updatelist(entries);
}

function updatelist(entries) {
  const uiTable = document.getElementById("temperatureTable");

  uiTable.innerHTML = "";
  const labelsRow = uiTable.insertRow();
  labelsRow.insertCell().appendChild(document.createTextNode('Time'));
  labelsRow.insertCell().appendChild(document.createTextNode('Temperature'));
  labelsRow.insertCell().appendChild(document.createTextNode('Humidity'));
  labelsRow.insertCell().appendChild(document.createTextNode('Perceived Temperature'));

  entries.reverse().forEach(entry => {
    const tableRow = uiTable.insertRow();
    try {
      const date = new Date(entry.time * 1000);

      // Hours part from the timestamp
      const hours = date.getHours();

      // Minutes part from the timestamp
      const minutes = "0" + date.getMinutes();

      // Seconds part from the timestamp
      const seconds = "0" + date.getSeconds();

      // Will display time in 10:30:23 format
      const formattedTime = `${date.getFullYear()}/${date.getMonth()}/${date.getDate()} ${date.getHours()}:${('0'+date.getMinutes()).substr(-2)}`;

      var formattedTemperatuere;
      var formattedHumidity;
      var formattedPercTemp;
      // I don't know why this is different on different computers but whatever
      try {
        formattedTemperatuere = `${entry.temperature.substr(0,4)} ℃`;
      } catch (e) {
        formattedTemperatuere = `${entry.temperature.toFixed(1)} ℃`;
      }
      try {
        formattedHumidity = `${entry.humidity.substr(0,4)}%`;
      } catch (e) {
        formattedHumidity = `${entry.humidity.toFixed(1)}%`;
      }
      try {
        formattedPercTemp = `${entry.perceived_temperature.substr(0,4)} ℃`;
      } catch (e) {
        formattedPercTemp = `${entry.perceived_temperature.toFixed(1)} ℃`;
      }
      tableRow.insertCell().appendChild(document.createTextNode(formattedTime));
      tableRow.insertCell().appendChild(document.createTextNode(formattedTemperatuere));
      tableRow.insertCell().appendChild(document.createTextNode(formattedHumidity));
      tableRow.insertCell().appendChild(document.createTextNode(formattedPercTemp));


    } catch (e) {
      console.log("Skipping entry due to:\n" + e);
    }
  });
}

function updateGraph(entries) {
  const dates = entries.map(entry => new Date(entry.time * 1000));
  var timeEntries;
  if (specifier == "/24h"){
    timeEntries = dates.map(date => `${date.getHours()}:${('0'+date.getMinutes()).substr(-2)}`);
  } else {
    timeEntries = dates.map(date => `${date.getFullYear()}/${date.getMonth()}/${date.getDate()} ${date.getHours()}:${('0'+date.getMinutes()).substr(-2)}`)
    timeEntries = dates.map(date => `${date.getDate()} ${monthsMap[date.getMonth()]}  ${date.getHours()}:${('0'+date.getMinutes()).substr(-2)}`)
  }

  const temperature = entries.map(entry => entry.temperature);
  const humidity = entries.map(entry => entry.humidity);
  const perceived_temperature = entries.map(entry => entry.perceived_temperature);

  if (tempChart) {
    tempChart.data.labels = timeEntries;
    tempChart.data.datasets[0].data = temperature;
    tempChart.data.datasets[1].data = perceived_temperature;
    tempChart.data.datasets[2].data = humidity;
    //console.log(tempChart.options.scales.B.position)
    //tempChart.options.scales.B.position = (tempChart.options.scales.B.position == 'left') ? 'right' : 'top';
    tempChart.update();
  } else {
    const ctx = document.getElementById('temperatureChart').getContext('2d');

    tempChart = new Chart(ctx, 
      {
        type: 'line',
        data: {
          labels: timeEntries,
          datasets: [
            {
              label: 'Temperature',
              color: '#ffffff',
              yAxisID: 'A',
              data: temperature,
              borderColor: 'rgba(75, 192, 192, 1)',
              backgroundColor: 'rgba(75, 192, 192, 0.2)',
              fill: true,
              hidden: true
            },
            {
              label: 'Perceived Temperature',
              yAxisID: 'A',
              data: perceived_temperature,
              borderColor: 'rgba(153, 102, 255, 1)',
              backgroundColor: 'rgba(153, 102, 255, 0.2)',
              fill: true
            },
            {
              label: 'Humidity',
              yAxisID: 'B',
              data: humidity,
              borderColor: humidityColor,
              backgroundColor: 'rgba(75, 192, 192, 0.2)',
              fill: false,
              hidden: true
            }
          ]
        },
        options: {
          responsive: true,
          aspectRatio: screen.availWidth/screen.availHeight + 0.5,
          plugins: {
            legend: {
              labels: {
                color: 'white'
              }
            }
          },
          scales: {
            'A': {
              type: 'linear',
              position: 'left',
              title: {
                display: true,
                text: 'Temperature (℃)',
                color: '#ffffff'
              },
              ticks: {
                color: '#ffffff'
              },
              grid: {
                color: "#aaaaaa"
              },
              suggestedMin: 0,
              suggestedMax: 30
            },
            'B': {
              type: 'linear',
              position: 'right',
              title: {
                display: true,
                text: 'Humidity (%)',
                color: humidityColor,
              },
              min: 0,
              max: 100,
              ticks: {
                color: humidityColor,
              },
              grid: {
                drawOnChartArea: false,
                color: humidityColor
              },
            },
            x: {
              title: {
                display: true,
                color: "#ffffff"
              },
              ticks: {
                color: "#ffffff"
              },
              grid: {
                color: "#aaaaaa"
              },
            }
          },
        }
      }
    );
  }
}
