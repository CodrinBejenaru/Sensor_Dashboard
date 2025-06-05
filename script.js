const sheetURL = 'https://docs.google.com/spreadsheets/d/1lWBKeNHYP2JXU_KINpevxeBvwWkAzG9HhWpx3ktGgSc/export?format=csv&gid=0';

async function fetchCSV() {
  const response = await fetch(sheetURL);
  const data = await response.text();
  return parseCSV(data);
}

// Parse DD/MM/YYYY HH:MM:SS
function formatDate(dmyHMS) {
  const [datePart, timePart] = dmyHMS.split(' ');
  const [day, month, year] = datePart.split('/');
  const [hour, min, sec] = timePart.split(':');
  const jsDate = new Date(`${year}-${month}-${day}T${hour}:${min}:${sec}`);
  const monthName = jsDate.toLocaleString('en-US', { month: 'long' });
  return `${hour}:${min}:${sec} ${day}/${monthName}/${year.slice(-2)}`;
}

function parseCSV(csv) {
  const [header, ...rows] = csv.trim().split('\n').map(row => row.split(','));

  // Take first 25 rows (newest), then reverse to keep chronological order
  const newest25 = rows.slice(0, 25).reverse();

  const labels = newest25.map(r => formatDate(r[0]));
  const sensors = header.slice(1);
  const datasets = sensors.map((_, i) => newest25.map(r => parseFloat(r[i + 1])));
  return { labels, sensors, datasets };
}

function createCharts(data) {
  const container = document.getElementById('charts');
  container.innerHTML = '';
  data.sensors.forEach((sensor, i) => {
    const canvas = document.createElement('canvas');
    container.appendChild(canvas);

    new Chart(canvas.getContext('2d'), {
      type: 'line',
      data: {
        labels: data.labels,
        datasets: [{
          label: sensor,
          data: data.datasets[i],
          fill: false,
          borderColor: 'rgba(75,192,192,1)',
          tension: 0.1
        }]
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: sensor,
            font: {
              size: 32,
              weight: 'bold'
            },
            color: '#00f5ff'
          },
          legend: {
            display: false
          }
        },
        scales: {
          x: {
            title: {
              display: true,
              text: "Time",
              color: '#ccc'
            },
            ticks: {
              color: '#aaa',
              autoSkip: false,
              maxRotation: 60,
              callback: function (_, index) {
                return index % 5 === 0 ? this.getLabelForValue(index) : '';
              }
            }
          },
          y: {
            title: {
              display: true,
              text: sensor,
              color: '#ccc'
            },
            ticks: {
              color: '#aaa'
            }
          }
        }
      }
    });
  });
}

fetchCSV().then(createCharts).catch(console.error);


