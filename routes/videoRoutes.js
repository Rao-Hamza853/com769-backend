// routes/videoRoutes.js
const express = require('express');
const multer = require('multer');
const { BlobServiceClient } = require('@azure/storage-blob');
const jwt = require('jsonwebtoken');
const Video = require('../models/videoModel');
const User = require('../models/userModel');

const router = express.Router();

// --- AZURE BLOB STORAGE SETUP ---
const blobServiceClient = BlobServiceClient.fromConnectionString(process.env.AZURE_STORAGE_CONNECTION_STRING);
const containerName = 'videos'; // Make sure you have a container named 'videos' in your storage account

// --- MULTER SETUP (for handling file uploads) ---
// We use memoryStorage because we're going to stream the file directly to Azure, not save it on our server's disk.
const upload = multer({ storage: multer.memoryStorage() });

// --- AUTHENTICATION MIDDLEWARE ---
// This function will run before our protected routes to check for a valid token
const auth = (req, res, next) => {
    const token = req.header('x-auth-token');
    if (!token) {
        return res.status(401).json({ message: 'No token, authorization denied.' });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded.user;
        next();
    } catch (err) {
        res.status(401).json({ message: 'Token is not valid.' });
    }
};

// --- ROUTES ---

// POST /api/videos/upload - Protected route for 'creator' accounts to upload videos [cite: 52]
router.post('/upload', [auth, upload.single('video')], async (req, res) => {
    // Check if user is a creator
    if (req.user.role !== 'creator') {
        return res.status(403).json({ message: 'Access denied. Only creators can upload videos.' });
    }
    if (!req.file) {
        return res.status(400).json({ message: 'Video file is required.' });
    }

    try {
        const containerClient = blobServiceClient.getContainerClient(containerName);
        const blobName = `${Date.now()}-${req.file.originalname}`;
        const blockBlobClient = containerClient.getBlockBlobClient(blobName);

        // Upload the file buffer to Azure
        await blockBlobClient.uploadData(req.file.buffer);
        const videoUrl = blockBlobClient.url;

        // Save video metadata to Cosmos DB
        const { title, publisher, producer, genre, ageRating } = req.body;
        const newVideo = new Video({
            title, publisher, producer, genre, ageRating, videoUrl,
            uploadedBy: req.user.id
        });
        await newVideo.save();

        res.status(201).json({ message: 'Video uploaded successfully!', video: newVideo });
    } catch (error) {
        res.status(500).json({ message: 'Server error during upload', error: error.message });
    }
});

// GET /api/videos - Get a list of all videos [cite: 55]
router.get('/', async (req, res) => {
    try {
        const videos = await Video.find().sort({ createdAt: -1 }); // Get latest videos first
        res.json(videos);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;