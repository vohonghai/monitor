const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();

app.use(cors()); // Enable CORS for all routes

app.get('/proxy', async (req, res) => {
    try {
        // Fetch data from the API
        const response = await axios.get('https://wfbeh93zxl.execute-api.ap-southeast-1.amazonaws.com/getdata');
        res.json(response.data);
    } catch (error) {
        console.error('Error fetching data from API:', error.message);
        if (error.response) {
            console.error('Response status:', error.response.status);
            console.error('Response data:', error.response.data);
            res.status(error.response.status).json(error.response.data);
        } else {
            res.status(500).json({ error: 'Error fetching data from the API' });
        }
    }
});

const PORT = 3000; // Ensure this port is available
app.listen(PORT, () => {
    console.log(`Proxy server running on http://localhost:${PORT}`);
});
