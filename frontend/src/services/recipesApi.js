import api from './api';

export function getRecipes({ search, category } = {}) {
  const params = {};
  if (search)   params.search   = search;
  if (category) params.category = category;
  return api.get('/recipes', { params });
}

export function getCategories() {
  return api.get('/recipes/categories');
}

export function getRecipe(id) {
  return api.get(`/recipes/${id}`);
}

export function createRecipe(data) {
  return api.post('/recipes', data);
}

export function updateRecipe(id, data) {
  return api.put(`/recipes/${id}`, data);
}

export function deleteRecipe(id) {
  return api.delete(`/recipes/${id}`);
}

export function getRecipeNutrition(id) {
  return api.get(`/recipes/${id}/nutrition`);
}
