const plannerService = require('../services/planner.service');

async function getDailyPlan(req, res) {
  try {
    const plan = await plannerService.generateDailyPlan(req.user.id);
    return res.json({ plan });
  } catch (err) {
    const status = err.status || 500;
    return res.status(status).json({ error: err.message || 'Failed to generate plan.' });
  }
}

module.exports = { getDailyPlan };
