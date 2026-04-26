import api from './api';

export function getMeals(date) {
  return api.get('/meals', { params: { date } });
}

export function createMeal(data) {
  return api.post('/meals', data);
}

export function addItem(mealId, data) {
  return api.post(`/meals/${mealId}/items`, data);
}

export function updateItem(mealId, itemId, data) {
  return api.put(`/meals/${mealId}/items/${itemId}`, data);
}

export function deleteItem(mealId, itemId) {
  return api.delete(`/meals/${mealId}/items/${itemId}`);
}

export function addItemFromRecipe(mealId, data) {
  return api.post(`/meals/${mealId}/items/from-recipe`, data);
}

export function logRecipeDirect(data) {
  return api.post('/meals/log-recipe', data);
}

export function getMealHistory(days = 7) {
  return api.get('/meals/history', { params: { days } });
}
