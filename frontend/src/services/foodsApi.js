import api from './api';

export function searchFoods(search) {
  return api.get('/foods', { params: { search } });
}

export function addItemFromFood(mealId, data) {
  return api.post(`/meals/${mealId}/items/from-food`, data);
}
