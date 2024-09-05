let temperatureChart; // Global variable to hold the chart instance
let allTemperatures = []; // Array to accumulate temperature data
let allHumidities = []; // Array to accumulate humidity data
let allTimestamps = []; // Array to accumulate timestamps

function fetchData() {
    const url = 'http://localhost:3000/proxy'; // URL of your running proxy server

    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status} - ${response.statusText}`);
            }
            return response.json();
        })
        .then(data => {
            accumulateData(data); // Accumulate new data points
            updateChart(); // Update the chart with accumulated data
        })
        .catch(error => {
            console.error('Error fetching data:', error);
        });
}

function accumulateData(data) {
    // Extract the latest temperature, humidity, and LocalTime
    const latestTemperature = data[0].Temperature;
    const latestHumidity = data[0].Humidity;
    const latestTimestamp = data[0].LocalTime; // Use the LocalTime directly

    // Add the new data points to the arrays
    allTemperatures.push(latestTemperature);
    allHumidities.push(latestHumidity);
    allTimestamps.push(latestTimestamp);

    // Limit the number of data points to keep the graph manageable
    if (allTemperatures.length > 50) {
        allTemperatures.shift(); // Remove the oldest temperature data point
        allHumidities.shift();   // Remove the oldest humidity data point
        allTimestamps.shift();   // Remove the oldest timestamp
    }
}

function updateChart() {
    // If the chart exists, update its data
    if (temperatureChart) {
        temperatureChart.data.labels = allTimestamps; // Update labels with LocalTime
        temperatureChart.data.datasets[0].data = allTemperatures; // Update temperature data
        temperatureChart.data.datasets[1].data = allHumidities; // Update humidity data
        temperatureChart.update(); // Update the chart to reflect new data
    } else {
        // Create the chart if it doesn't exist
        const ctx = document.getElementById('temperatureChart').getContext('2d');
        temperatureChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: allTimestamps, // Use LocalTime for labels
                datasets: [{
                    label: 'Temperature (°C)',
                    data: allTemperatures,
                    borderColor: 'rgba(75, 192, 192, 1)',
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    borderWidth: 1,
                    tension: 0.4, // Smooth the line
                    yAxisID: 'y' // Assign to the first y-axis (left side)
                },
                {
                    label: 'Humidity (%)',
                    data: allHumidities,
                    borderColor: 'rgba(255, 159, 64, 1)',
                    backgroundColor: 'rgba(255, 159, 64, 0.2)',
                    borderWidth: 1,
                    tension: 0.4, // Smooth the line
                    yAxisID: 'y1' // Assign to the second y-axis (right side)
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: true,
                    },
                    customAnnotationBoxes: {
                        draw(chart) {
                            const ctx = chart.ctx;
                            const { top, right } = chart.chartArea;
                            ctx.save();

                            // Draw the temperature annotation box
                            ctx.fillStyle = 'rgba(75, 192, 192, 0.8)';
                            ctx.fillRect(right - 130, top - 40, 120, 25); // Position for temperature box
                            ctx.fillStyle = 'white';
                            ctx.font = '14px Arial';
                            ctx.textAlign = 'center';
                            ctx.fillText(`Temp: ${allTemperatures[allTemperatures.length - 1]} °C`, right - 70, top - 22);

                            // Draw the humidity annotation box
                            ctx.fillStyle = 'rgba(255, 159, 64, 0.8)';
                            ctx.fillRect(right - 130, top - 70, 120, 25); // Position for humidity box
                            ctx.fillStyle = 'white';
                            ctx.font = '14px Arial';
                            ctx.textAlign = 'center';
                            ctx.fillText(`Humi: ${allHumidities[allHumidities.length - 1]} %`, right - 70, top - 52);

                            ctx.restore();
                        }
                    }
                },
                layout: {
                    padding: {
                        top: 80, // Add padding to make room for the annotation above the chart
                    },
                },
                scales: {
                    x: {
                        display: true,
                        title: {
                            display: true,
                            text: 'Local Time',
                        },
                    },
                    y: {
                        type: 'linear',
                        display: true,
                        position: 'left',
                        title: {
                            display: true,
                            text: 'Temperature (°C)',
                        },
                        beginAtZero: true
                    },
                    y1: {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        title: {
                            display: true,
                            text: 'Humidity (%)',
                        },
                        beginAtZero: true,
                        grid: {
                            drawOnChartArea: false, // Keep grid lines for humidity separate from temperature
                        },
                    },
                },
            },
            plugins: [{
                id: 'customAnnotationBoxes',
                beforeDraw(chart, args, options) {
                    options.draw(chart); // Call the custom draw function for annotation boxes
                }
            }]
        });
    }
}

// Automatically fetch data every 10 seconds and update the chart
setInterval(fetchData, 10000); // 10000 milliseconds = 10 seconds

// Fetch data once immediately to load data when the page loads
fetchData();
