const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  status: { type: Number, default: 1 },
});

// Check if the model exists before compiling it
module.exports = mongoose.models.User || mongoose.model('User', userSchema);