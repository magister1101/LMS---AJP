const express = require('express');
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;

const app = express();

// Configure Cloudinary
cloudinary.config({
    cloud_name: 'drv1z32zg', // Replace with your Cloudinary cloud name
    api_key: '536474374565656',       // Replace with your Cloudinary API key
    api_secret: 'ebWhJQESHUbv9eTSA88RN-Acnsc', // Replace with your Cloudinary API secret
});


// Set up Cloudinary storage
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (req, file) => {
        const originalName = file.originalname;
        const extension = originalName.substring(originalName.lastIndexOf('.') + 1); // Extract the extension
        const baseName = originalName.substring(0, originalName.lastIndexOf('.'));  // Extract the base name

        return {
            folder: 'uploads',
            resource_type: 'raw',
            public_id: `${baseName}`,
            format: extension,
        };
    },
});

// Set up Multer
const upload = multer({ storage: storage });

module.exports = { upload };
