import api from './api';

export function getMe() {
  return api.get('/users/me');
}

export function updateMe(data) {
  return api.put('/users/me', data);
}
