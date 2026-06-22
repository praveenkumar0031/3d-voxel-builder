const express = require('express');
const router = express.Router();
const Scene = require('../models/Scene');
const User = require('../models/User');
const auth = require('../middleware/auth');

// Helper to update user statistics
const updateUserStats = async (userId) => {
  try {
    const scenes = await Scene.find({ owner: userId });
    const totalScenes = scenes.length;
    const totalVoxels = scenes.reduce((sum, scene) => sum + (scene.voxelCount || 0), 0);
    await User.findByIdAndUpdate(userId, { totalScenes, totalVoxels });
  } catch (error) {
    console.error('Error updating user stats:', error);
  }
};

// GET /api/scenes/public
// No authentication required. Returns metadata only for all public scenes.
router.get('/public', async (req, res, next) => {
  try {
    const publicScenes = await Scene.find({ isPublic: true })
      .select('-voxels')
      .populate('owner', 'username avatar')
      .sort({ updatedAt: -1 });

    return res.json(publicScenes);
  } catch (error) {
    next(error);
  }
});

// GET /api/scenes
// Protected. List all scenes owned by the logged-in user, sorted by updatedAt desc, metadata only
router.get('/', auth, async (req, res, next) => {
  try {
    const scenes = await Scene.find({ owner: req.user.id })
      .select('-voxels')
      .sort({ updatedAt: -1 });

    return res.json(scenes);
  } catch (error) {
    next(error);
  }
});

// POST /api/scenes
// Protected. Save new scene, update owner.totalScenes and owner.totalVoxels
router.post('/', auth, async (req, res, next) => {
  try {
    const { name, description, voxels, thumbnail, tags, isPublic } = req.body;

    const voxelCount = Array.isArray(voxels) ? voxels.length : 0;

    const newScene = new Scene({
      owner: req.user.id,
      name: name || 'Untitled Scene',
      description: description || '',
      voxels: Array.isArray(voxels) ? voxels : [],
      voxelCount,
      thumbnail: thumbnail || '',
      tags: Array.isArray(tags) ? tags : [],
      isPublic: isPublic || false,
    });

    await newScene.save();
    await updateUserStats(req.user.id);

    return res.status(201).json(newScene);
  } catch (error) {
    next(error);
  }
});

// GET /api/scenes/:id
// Protected. Load full scene including voxels, verify ownership
router.get('/:id', auth, async (req, res, next) => {
  try {
    const scene = await Scene.findById(req.id || req.params.id);
    if (!scene) {
      return res.status(404).json({ error: 'Scene not found' });
    }

    if (scene.owner.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden: You do not own this scene' });
    }

    return res.json(scene);
  } catch (error) {
    next(error);
  }
});

// PUT /api/scenes/:id
// Protected. Update name, description, voxels, thumbnail, tags, set updatedAt, recalculate voxelCount, update owner stats
router.put('/:id', auth, async (req, res, next) => {
  try {
    const scene = await Scene.findById(req.params.id);
    if (!scene) {
      return res.status(404).json({ error: 'Scene not found' });
    }

    if (scene.owner.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden: You do not own this scene' });
    }

    const { name, description, voxels, thumbnail, tags, isPublic } = req.body;

    if (name !== undefined) scene.name = name;
    if (description !== undefined) scene.description = description;
    if (voxels !== undefined) {
      scene.voxels = Array.isArray(voxels) ? voxels : [];
      scene.voxelCount = scene.voxels.length;
    }
    if (thumbnail !== undefined) scene.thumbnail = thumbnail;
    if (tags !== undefined) scene.tags = Array.isArray(tags) ? tags : [];
    if (isPublic !== undefined) scene.isPublic = isPublic;

    scene.updatedAt = Date.now();

    await scene.save();
    await updateUserStats(req.user.id);

    return res.json(scene);
  } catch (error) {
    next(error);
  }
});

// DELETE /api/scenes/:id
// Protected. Delete scene, decrement owner stats
router.delete('/:id', auth, async (req, res, next) => {
  try {
    const scene = await Scene.findById(req.params.id);
    if (!scene) {
      return res.status(404).json({ error: 'Scene not found' });
    }

    if (scene.owner.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden: You do not own this scene' });
    }

    await Scene.deleteOne({ _id: scene._id });
    await updateUserStats(req.user.id);

    return res.json({ message: 'Scene deleted successfully' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
