const UserModel = require('../models/user.model');

async function getProfile(userId) {
  const user = await UserModel.findById(userId);
  if (!user) throw { status: 404, message: 'User not found.' };
  return user;
}

async function updateProfile(userId, data) {
  const user = await UserModel.updateById(userId, data);
  if (!user) throw { status: 404, message: 'User not found.' };
  return user;
}

async function deleteAccount(userId) {
  // TODO: delete user row
}

module.exports = { getProfile, updateProfile, deleteAccount };
