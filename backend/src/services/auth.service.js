const bcrypt = require('bcrypt');
const jwt    = require('jsonwebtoken');
const UserModel = require('../models/user.model');

const SALT_ROUNDS = 10;

async function register({ username, email, password }) {
  const emailTaken = await UserModel.findByEmail(email);
  if (emailTaken) {
    throw { status: 409, message: 'Email is already in use.' };
  }

  const usernameTaken = await UserModel.findByUsername(username);
  if (usernameTaken) {
    throw { status: 409, message: 'Username is already taken.' };
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const user = await UserModel.create({ username, email, passwordHash });
  return user;
}

async function login({ email, password }) {
  const user = await UserModel.findByEmail(email);
  if (!user) {
    throw { status: 401, message: 'Invalid email or password.' };
  }

  const match = await bcrypt.compare(password, user.password_hash);
  if (!match) {
    throw { status: 401, message: 'Invalid email or password.' };
  }

  const token = jwt.sign(
    { id: user.id, email: user.email, role: 'user' },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  return {
    token,
    user: { id: user.id, username: user.username, email: user.email },
  };
}

module.exports = { register, login };
