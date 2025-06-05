const sheetURL = 'https://docs.google.com/spreadsheets/d/1lWBKeNHYP2JXU_KINpevxeBvwWkAzG9HhWpx3ktGgSc/export?format=csv&gid=0';

async function fetchCSV() {
  const response = await fetch(sheetURL);
  const data = await response.text();
  return parseCSV(data);
}

function formatDate(dateString) {
  const date = new Date(dateString);
  const hours = date.getHours().toString().padStart(2, '0');
  const mins = date.getMinutes().toString().padStart(2, '0');
  const secs = date.getSeconds().toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const monthName = date.toLocaleString('en-US', { month: 'long' });
  const year = date.getFullYear().toString().slice(-2);
  return `${hours}:${mins}:${secs} ${day}/${monthName}/${year}`;
}

function parseCSV(csv) {
  const [header, ...rows] = csv.trim().split('\n').map(row => row.split(','));

  // Get the first 25 rows (most recent at top), reverse to oldest ➜ newest
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
            font: { size: 50 }, // Matches page title (h1)
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
              color: '#aaa'
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

