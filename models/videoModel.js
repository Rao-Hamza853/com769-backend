// models/videoModel.js
const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    user: { type: String, required: true },
    text: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

const videoSchema = new mongoose.Schema({
    title: { type: String, required: true },
    publisher: { type: String },
    producer: { type: String },
    genre: { type: String },
    ageRating: { type: String },
    videoUrl: { type: String, required: true },
    // Creates a reference to a User document
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    comments: [commentSchema]
}, { timestamps: true }); // Automatically adds createdAt and updatedAt fields

module.exports = mongoose.model('Video', videoSchema);