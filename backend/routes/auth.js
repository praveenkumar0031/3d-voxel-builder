const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');

// Helper to generate access token
const generateAccessToken = (user) => {
  return jwt.sign(
    { id: user._id, username: user.username, email: user.email },
    process.env.JWT_SECRET || 'super_secret_jwt_access_token_key_123!',
    { expiresIn: '15m' }
  );
};

// Helper to generate refresh token
const generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user._id },
    process.env.JWT_REFRESH_SECRET || 'super_secret_jwt_refresh_token_key_456!',
    { expiresIn: '7d' }
  );
};

// Helper to set refresh token cookie
const setRefreshTokenCookie = (res, token) => {
  res.cookie('refreshToken', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/'
  });
};

// POST /api/auth/register
router.post('/register', async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const existingUser = await User.findOne({
      $or: [
        { email: email.toLowerCase() },
        { username: username.toLowerCase() }
      ]
    });

    if (existingUser) {
      return res.status(400).json({ error: 'Username or email already exists' });
    }

    // Generate avatar color/initials (e.g. "A|#3e82f1")
    const initial = username.trim().charAt(0).toUpperCase();
    const colors = ['#3e82f1', '#ff6b6b', '#ffd166', '#4db6ac', '#ba68c8', '#ff8a65'];
    const hash = username.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const color = colors[hash % colors.length];
    const avatar = `${initial}|${color}`;

    // Hash password with 12 rounds
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      username,
      email: email.toLowerCase(),
      password: hashedPassword,
      avatar,
    });

    await newUser.save();

    const accessToken = generateAccessToken(newUser);
    const refreshToken = generateRefreshToken(newUser);
    setRefreshTokenCookie(res, refreshToken);

    return res.status(201).json({
      accessToken,
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        avatar: newUser.avatar,
        createdAt: newUser.createdAt,
        totalScenes: newUser.totalScenes,
        totalVoxels: newUser.totalVoxels
      }
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/auth/login
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    setRefreshTokenCookie(res, refreshToken);

    return res.json({
      accessToken,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        createdAt: user.createdAt,
        totalScenes: user.totalScenes,
        totalVoxels: user.totalVoxels
      }
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/auth/refresh
router.post('/refresh', async (req, res, next) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      return res.status(401).json({ error: 'Unauthorized: No refresh token' });
    }

    let decoded;
    try {
      decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || 'super_secret_jwt_refresh_token_key_456!');
    } catch (err) {
      return res.status(401).json({ error: 'Unauthorized: Invalid refresh token' });
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized: User not found' });
    }

    const newAccessToken = generateAccessToken(user);
    // Optionally rotate refresh token
    const newRefreshToken = generateRefreshToken(user);
    setRefreshTokenCookie(res, newRefreshToken);

    return res.json({
      accessToken: newAccessToken
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  res.clearCookie('refreshToken', {
    path: '/'
  });
  return res.json({ message: 'Logged out successfully' });
});

// GET /api/auth/me
router.get('/me', auth, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    return res.json(user);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
