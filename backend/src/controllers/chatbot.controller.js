const chatbotService = require('../services/chatbot.service');

async function sendMessage(req, res) {
  const { message, history } = req.body;
  try {
    const reply = await chatbotService.sendMessage(req.user.id, message, history);
    return res.json({ reply });
  } catch (err) {
    const status = err.status || 500;
    return res.status(status).json({ error: err.message || 'Chatbot request failed.' });
  }
}

module.exports = { sendMessage };
