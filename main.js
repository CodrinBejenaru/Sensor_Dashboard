const SPREADSHEET_ID_CAMERA1 = '1lWBKeNHYP2JXU_KINpevxeBvwWkAzG9HhWpx3ktGgSc'; // ID Camera 1
const SPREADSHEET_ID_CAMERA2 = '1TWCycPRX4_MGDTG4q3q_fVfulqYWpEqjGVjtiK2YZ-E'; // ID Camera 2

let currentSpreadsheetId = SPREADSHEET_ID_CAMERA1; // variabilă globală ca să știm pe ce cameră suntem

function loadDashboard(spreadsheetId, selectedDate = null) {
  const today = new Date();

  let yyyy, mm, dd;

  if (selectedDate) {
    // Dacă avem dată selectată manual
    const parts = selectedDate.split('-');
    yyyy = parts[0];
    mm = parts[1];
    dd = parts[2];
  } else {
    // Dacă nu → data de azi
    yyyy = today.getFullYear();
    mm = String(today.getMonth() + 1).padStart(2, '0');
    dd = String(today.getDate()).padStart(2, '0');
  }

  const sheetName = `Sensor_${yyyy}-${mm}-${dd}`;

  const csvUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tqx=out:csv&sheet=${sheetName}`;

  //console.log("CSV URL:", csvUrl);

  fetch(csvUrl)
    .then(response => response.text())
    .then(data => {
      console.log("Raw CSV Data:", data);

      const rows = data.split('\n').map(row => row.split(','));
      console.log("Parsed Rows:", rows);

      const headers = rows[0].map(h => h.trim());
      const time = rows.slice(1).map(row => row[0]);

      console.log("Headers:", headers);
      console.log("Time column:", time);

      // Stergem vechile grafice
      document.getElementById('grid').innerHTML = '';

      for (let i = 1; i < headers.length; i++) {
        const values = rows.slice(1).map(row => {
          const val = row[i];
          return val && val.trim() !== "" ? parseFloat(val.replace(/^"+|"+$/g, '').trim()) : null;
        });

        console.log(`Data for ${headers[i]}:`, values);

        const container = document.createElement('div');
        container.className = 'chart-container';
        const canvas = document.createElement('canvas');
        container.appendChild(canvas);
        document.getElementById('grid').appendChild(container);

        new Chart(canvas, {
          type: 'line',
          data: {
            labels: time,
            datasets: [{
              label: headers[i],
              data: values,
              borderWidth: 2,
              pointRadius: 3,
              fill: false,
              tension: 0.1
            }]
          },
          options: {
            scales: {
              x: {
                display: false
              },
              y: {
                ticks: {
                  beginAtZero: true,
                  font: {
                    size: 14
                  }
                }
              },
              maintainAspectRatio: false
            },
            plugins: {
              legend: {
                labels: {
                  font: {
                    size: 16
                  }
                }
              },
              tooltip: {
                mode: 'index',
                intersect: false,
                bodyFont: {
                  size: 14
                },
                titleFont: {
                  size: 16
                }
              }
            }
          }
        });
      }
    })
    .catch(error => {
      console.error("Error loading CSV:", error);
    });
}

// Inițializăm data picker cu data de azi
function setTodayDateInPicker() {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  document.getElementById('datePicker').value = `${yyyy}-${mm}-${dd}`;
}

// La început încărcăm camera 1 cu data de azi
setTodayDateInPicker();
loadDashboard(currentSpreadsheetId);

// Evenimente pe butoane camere
document.getElementById('camera1Btn').addEventListener('click', () => {
  currentSpreadsheetId = SPREADSHEET_ID_CAMERA1;
  const selectedDate = document.getElementById('datePicker').value;
  loadDashboard(currentSpreadsheetId, selectedDate);
});

document.getElementById('camera2Btn').addEventListener('click', () => {
  currentSpreadsheetId = SPREADSHEET_ID_CAMERA2;
  const selectedDate = document.getElementById('datePicker').value;
  loadDashboard(currentSpreadsheetId, selectedDate);
});

// Eveniment pe schimbare de dată
document.getElementById('datePicker').addEventListener('change', () => {
  const selectedDate = document.getElementById('datePicker').value;
  loadDashboard(currentSpreadsheetId, selectedDate);
});
