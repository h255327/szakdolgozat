const authService = require('../services/auth.service');

async function register(req, res) {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ error: 'username, email and password are required.' });
  }

  try {
    const user = await authService.register({ username, email, password });
    return res.status(201).json({ message: 'Registration successful.', user });
  } catch (err) {
    const status = err.status || 500;
    return res.status(status).json({ error: err.message || 'Registration failed.' });
  }
}

async function login(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'email and password are required.' });
  }

  try {
    const result = await authService.login({ email, password });
    return res.json({ message: 'Login successful.', ...result });
  } catch (err) {
    const status = err.status || 500;
    return res.status(status).json({ error: err.message || 'Login failed.' });
  }
}

async function logout(req, res) {
  // TODO: implement token blacklist or session invalidation
  res.json({ message: 'Logged out successfully.' });
}

module.exports = { register, login, logout };
