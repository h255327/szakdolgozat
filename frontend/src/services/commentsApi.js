import api from './api';

const TYPE_PATH = { recipe: 'recipes', article: 'articles' };

export function getComments(targetType, entityId) {
  return api.get(`/${TYPE_PATH[targetType]}/${entityId}/comments`);
}

export function addComment(targetType, entityId, content) {
  return api.post(`/${TYPE_PATH[targetType]}/${entityId}/comments`, { content });
}

export function deleteComment(commentId) {
  return api.delete(`/comments/${commentId}`);
}

// Convenience aliases used by page components.
export const getRecipeComments  = (id)          => getComments('recipe', id);
export const addRecipeComment   = (id, content) => addComment('recipe', id, content);
export const getArticleComments = (id)          => getComments('article', id);
export const addArticleComment  = (id, content) => addComment('article', id, content);
