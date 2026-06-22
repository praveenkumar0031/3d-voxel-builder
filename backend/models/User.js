const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, trim: true },
  email:    { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  avatar:   { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
  totalScenes: { type: Number, default: 0 },
  totalVoxels: { type: Number, default: 0 },
});

module.exports = mongoose.model('User', UserSchema);
