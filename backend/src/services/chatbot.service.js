const OpenAI    = require('openai');
const UserModel = require('../models/user.model');

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

function buildSystemPrompt(user) {
  const lines = [
    'You are a knowledgeable and friendly nutrition assistant for the HealthyEat app.',
    'You provide practical, evidence-based advice on healthy eating, meal planning, and nutrition.',
    'Keep your answers concise, helpful, and encouraging.',
    '',
    'User profile:',
    `- Username: ${user.username}`,
  ];

  if (user.goal)           lines.push(`- Health goal: ${user.goal.replace(/_/g, ' ')}`);
  if (user.diet_type)      lines.push(`- Diet type: ${user.diet_type}`);
  if (user.calorie_target) lines.push(`- Daily calorie target: ${user.calorie_target} kcal`);
  if (user.weight)         lines.push(`- Weight: ${user.weight} kg`);

  lines.push(
    '',
    'Always personalise your advice based on the user\'s profile above.',
    'Focus exclusively on healthy eating, nutrition, meal planning, and wellness.',
    'If a question involves medical diagnosis or treatment, advise the user to consult a healthcare professional.',
    'Be concise — prefer short, actionable answers unless the user asks for detail.'
  );

  return lines.join('\n');
}

async function sendMessage(userId, message, history = []) {
  if (!message || !message.trim()) {
    throw { status: 400, message: 'message is required.' };
  }

  const user = await UserModel.findById(userId);
  if (!user) throw { status: 404, message: 'User not found.' };

  const systemPrompt = buildSystemPrompt(user);

  // Build messages array: system + prior turns + new user message
  const messages = [
    { role: 'system', content: systemPrompt },
    ...history.slice(-10).map(({ role, content }) => ({ role, content })),
    { role: 'user', content: message.trim() },
  ];

  const completion = await client.chat.completions.create({
    model:       'gpt-4o-mini',
    messages,
    max_tokens:  512,
    temperature: 0.7,
  });

  const reply = completion.choices[0]?.message?.content?.trim() || '';
  return reply;
}

module.exports = { sendMessage };
