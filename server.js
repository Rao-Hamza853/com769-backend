// server.js
require('dotenv').config(); // This must be the first line to ensure environment variables are available
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// --- INITIALIZE EXPRESS APP ---
const app = express();

// --- MIDDLEWARE ---
app.use(cors()); // Enable Cross-Origin Resource Sharing
app.use(express.json()); // Enable the Express app to parse JSON formatted request bodies

// --- DATABASE CONNECTION ---
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.COSMOS_DB_CONNECTION_STRING);
        console.log('Successfully connected to Azure Cosmos DB');
    } catch (err) {
        console.error('Failed to connect to Azure Cosmos DB', err);
        process.exit(1); // Exit process with failure
    }
};
connectDB();

// --- API ROUTES ---
// This tells the app that for any URL starting with '/api/users', it should use the routes defined in userRoutes.js
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/videos', require('./routes/videoRoutes'));

// A simple test route
app.get('/', (req, res) => {
    res.send('COM769 Backend API is running...');
});

// --- START THE SERVER ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));