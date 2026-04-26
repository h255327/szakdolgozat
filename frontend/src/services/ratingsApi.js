import api from './api';

export function getRecipeRating(recipeId) {
  return api.get(`/recipes/${recipeId}/ratings`);
}

export function rateRecipe(recipeId, score) {
  return api.put(`/recipes/${recipeId}/ratings`, { score });
}
