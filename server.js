const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Parse JSON and urlencoded request bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API endpoint for form submission
app.post('/api/start-automation', (req, res) => {
    // In a real application, you would process the data here
    console.log('Received automation request:', req.body);
    res.json({ 
        success: true, 
        message: 'Automation started successfully!',
        data: req.body
    });
});

// Serve the main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});