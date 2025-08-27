// models/userModel.js
const mongoose = require('mongoose');
// import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true, trim: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['consumer', 'creator'], default: 'consumer' }
});

// The first argument 'User' is the singular name of the collection your model is for.
// Mongoose automatically looks for the plural, lowercased version of your model name.
// Thus, for the model 'User', Mongoose will create a collection named 'users'.
module.exports = mongoose.model('User', userSchema);