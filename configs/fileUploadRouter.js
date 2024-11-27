const express = require('express');
const multer = require('multer');
const { google } = require('googleapis');
const fs = require('fs');

const CREDENTIALS = require('../credentials.json');
const REFRESH_TOKEN = '1//04W7uCd4N7_0mCgYIARAAGAQSNwF-L9IrTMAL0HaK77OqHbFUjMDFu45ZM2kcbqZpvi_RgZoarnkB7IAVYGLdsRIK9kcydtD5H3A'; // Replace with a valid refresh token

const oauth2Client = new google.auth.OAuth2(
    CREDENTIALS.web.client_id,
    CREDENTIALS.web.client_secret,
    CREDENTIALS.web.redirect_uris[0]
);

oauth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

const drive = google.drive({ version: 'v3', auth: oauth2Client });

const upload = multer({ dest: 'uploads/' }); // Temporary storage

const router = express.Router();

router.post('/upload', upload.single('file'), async (req, res) => {
    try {
        const file = req.file;

        if (!file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        // Upload the file to Google Drive
        const response = await drive.files.create({
            requestBody: {
                name: file.originalname, // Set the file name
                mimeType: file.mimetype, // File MIME type
            },
            media: {
                mimeType: file.mimetype,
                body: fs.createReadStream(file.path), // Read the file
            },
        });

        const fileId = response.data.id;

        // Set file permissions to make it accessible
        await drive.permissions.create({
            fileId,
            requestBody: {
                role: 'reader', // Allow read access
                type: 'anyone', // Accessible to anyone
            },
        });

        // Generate a public URL dynamically
        const publicUrl = `https://drive.google.com/file/d/${fileId}/view`;

        // Clean up the file from the server
        fs.unlinkSync(file.path);

        // Send response
        res.status(200).json({ success: true, fileId, publicUrl });
    } catch (error) {
        console.error('Error uploading file to Google Drive:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;
