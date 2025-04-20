const express = require('express');
const path = require('path');
const multer = require('multer');
const xlsx = require('xlsx');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Configure multer for file uploads
const upload = multer({ dest: 'uploads/' });

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Parse JSON and urlencoded request bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API endpoint for form submission
app.post('/api/start-automation', upload.single('excelFile'), async (req, res) => {
    try {
        const { websiteUrl, scheduleTime, smsAlert, phoneNumber } = req.body;
        
        // Validate required fields
        if (!websiteUrl || !scheduleTime || !smsAlert) {
            return res.status(400).json({ 
                success: false, 
                message: 'Missing required fields' 
            });
        }

        // Validate Excel file
        if (!req.file) {
            return res.status(400).json({ 
                success: false, 
                message: 'No Excel file uploaded' 
            });
        }

        // Read and validate Excel file
        const workbook = xlsx.readFile(req.file.path);
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = xlsx.utils.sheet_to_json(worksheet);

        // Validate Excel structure
        const validationResult = validateExcelData(jsonData);
        if (!validationResult.valid) {
            // Clean up uploaded file
            fs.unlinkSync(req.file.path);
            return res.status(400).json({ 
                success: false, 
                message: validationResult.message 
            });
        }

        // If all validations pass
        console.log('Valid data received:', {
            websiteUrl,
            scheduleTime,
            smsAlert,
            phoneNumber,
            postCount: jsonData.length
        });

        // Clean up uploaded file
        fs.unlinkSync(req.file.path);

        res.json({ 
            success: true, 
            message: 'Automation started successfully!',
            postCount: jsonData.length
        });

    } catch (error) {
        console.error('Error processing request:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Internal server error' 
        });
    }
});

// Excel validation function
function validateExcelData(data) {
    if (!data || data.length === 0) {
        return {
            valid: false,
            message: 'Excel sheet is empty. Please provide data.'
        };
    }

    for (const [index, row] of data.entries()) {
        // Check for required columns
        if (!row['Post Title'] || !row['Post Content'] || !row['Post Status']) {
            return {
                valid: false,
                message: `Required columns missing in row ${index + 1}. Please include "Post Title", "Post Content", and "Post Status" columns.`
            };
        }

        // Validate Post Title
        if (typeof row['Post Title'] !== 'string' || row['Post Title'].split(' ').length < 7) {
            return {
                valid: false,
                message: `Post Title in row ${index + 1} must be at least 7 words long.`
            };
        }

        // Validate Post Content
        if (typeof row['Post Content'] !== 'string' || row['Post Content'].split(' ').length < 1000) {
            return {
                valid: false,
                message: `Post Content in row ${index + 1} must be at least 1000 words long.`
            };
        }

        // Validate Post Status
        if (row['Post Status'].toLowerCase() !== 'publish') {
            return {
                valid: false,
                message: `Post Status in row ${index + 1} must be "Publish". Found "${row['Post Status']}" instead.`
            };
        }
    }

    return { valid: true };
}

// Serve the main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Serve FAQ page
app.get('/faq', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'faq.html'));
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});