const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: No token provided' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'super_secret_jwt_access_token_key_123!');
    req.user = {
      id: decoded.id,
      username: decoded.username,
      email: decoded.email
    };
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Unauthorized: Invalid or expired token' });
  }
};
