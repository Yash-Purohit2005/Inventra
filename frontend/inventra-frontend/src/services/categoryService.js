import api from './api';

export const getCategories = () => api.get('/categories/get-all-categories');
export const getCategoryById = (id) => api.get(`/categories/id/${id}`);
export const getProductsByCategory = (id) => api.get(`/categories/${id}/products`);
export const createCategory = (data) => api.post('/categories/create', data);
export const updateCategory = (id, data) => api.put(`/categories/id/${id}`, data);
export const deleteCategory = (id) => api.delete(`/categories/id/${id}`);