// Paste your public Google Sheets CSV URL below:
const sheetURL = 'https://docs.google.com/spreadsheets/d/1lWBKeNHYP2JXU_KINpevxeBvwWkAzG9HhWpx3ktGgSc/export?format=csv&gid=0';

async function fetchCSV() {
  const response = await fetch(sheetURL);
  const data = await response.text();
  console.log(data);
  return parseCSV(data);
}

function parseCSV(csv) {
  const [header, ...rows] = csv.trim().split('\n').map(row => row.split(','));
  const labels = rows.map(r => r[0]);
  const sensors = header.slice(1);
  const datasets = sensors.map((_, i) => rows.map(r => parseFloat(r[i + 1])));
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
      }
    });
  });
}

fetchCSV().then(createCharts).catch(console.error);