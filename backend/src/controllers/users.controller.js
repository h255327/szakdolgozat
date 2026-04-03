const usersService = require('../services/users.service');

async function getMe(req, res) {
  try {
    const user = await usersService.getProfile(req.user.id);
    return res.json({ user: { ...user, role: req.user.role } });
  } catch (err) {
    const status = err.status || 500;
    return res.status(status).json({ error: err.message || 'Failed to fetch profile.' });
  }
}

async function updateMe(req, res) {
  const allowed = [
    'username', 'weight', 'goal',
    'diet_type', 'calorie_target', 'notification_preferences',
  ];

  const data = Object.fromEntries(
    Object.entries(req.body).filter(([k]) => allowed.includes(k))
  );

  if (Object.keys(data).length === 0) {
    return res.status(400).json({ error: 'No valid fields provided.' });
  }

  try {
    const user = await usersService.updateProfile(req.user.id, data);
    return res.json({ message: 'Profile updated.', user });
  } catch (err) {
    const status = err.status || 500;
    return res.status(status).json({ error: err.message || 'Failed to update profile.' });
  }
}

async function getProfile(req, res) {
  // TODO: get authenticated user's profile
  res.json({ message: 'getProfile – not implemented' });
}

async function updateProfile(req, res) {
  // TODO: update authenticated user's profile
  res.json({ message: 'updateProfile – not implemented' });
}

async function deleteAccount(req, res) {
  // TODO: delete authenticated user's account
  res.json({ message: 'deleteAccount – not implemented' });
}

module.exports = { getMe, updateMe, getProfile, updateProfile, deleteAccount };
