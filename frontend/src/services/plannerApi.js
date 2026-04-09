import api from './api';

export function getDailyPlan() {
  return api.get('/planner/daily');
}
