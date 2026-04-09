import api from './api';

export function generateShoppingList(recipeIds) {
  return api.post('/shopping/generate', { recipe_ids: recipeIds });
}
