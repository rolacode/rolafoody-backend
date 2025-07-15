const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  fullName: String,
  email: { type: String, unique: true },
  password: String,
  phone: String,
  role: { type: String, enum: ['buyer', 'vendor', 'chef'] },
  avatar: String,
  businessName: String,
  serviceDescription: String,
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
