import api from './api';

export function sendMessage(message, history) {
  return api.post('/chatbot/message', { message, history });
}
