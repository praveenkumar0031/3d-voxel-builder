const mongoose = require('mongoose');

const VoxelSchema = new mongoose.Schema({
  x: { type: Number, required: true },
  y: { type: Number, required: true },
  z: { type: Number, required: true },
  color: { type: Number, required: true }
}, { _id: false });

const SceneSchema = new mongoose.Schema({
  owner:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name:        { type: String, required: true, default: 'Untitled Scene' },
  description: { type: String, default: '' },
  voxels:      [VoxelSchema],
  voxelCount:  { type: Number, default: 0 },
  thumbnail:   { type: String, default: '' }, // base64 PNG snapshot
  tags:        [{ type: String }],
  isPublic:    { type: Boolean, default: false },
  createdAt:   { type: Date, default: Date.now },
  updatedAt:   { type: Date, default: Date.now },
});

module.exports = mongoose.model('Scene', SceneSchema);
