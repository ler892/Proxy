const express = require('express');
const fetch = require('node-fetch'); // Ensure node-fetch is available
const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS requests so your GitHub Pages frontend can talk to it
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

// The core route that requests, fetches, and delivers the data
app.get('/proxy', async (req, res) => {
    const targetUrl = req.query.url;
    
    if (!targetUrl) {
        return res.status(400).send("Error: Missing target URL parameter (?url=...)");
    }

    try {
        console.log(`[Proxy] Tunneling request to: ${targetUrl}`);
        
        const response = await fetch(targetUrl, {
            method: 'GET',
            headers: { 
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' 
            }
        });

        // Forward content type (HTML, text, etc) back to browser
        const contentType = response.headers.get('content-type');
        if (contentType) {
            res.setHeader('Content-Type', contentType);
        }

        // Send the page contents down the pipe
        const body = await response.text();
        res.send(body);

    } catch (error) {
        console.error(`[Proxy Error]: ${error.message}`);
        res.status(500).send(`Proxy could not reach target server: ${error.message}`);
    }
});

// Initialize server
app.listen(PORT, () => {
    console.log(`Proxy backend is successfully running on port ${PORT}`);
});
