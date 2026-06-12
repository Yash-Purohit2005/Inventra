import api from './api';

export const getProducts = (page = 0, size = 10) =>
  api.get(`/products/get-all-products?page=${page}&size=${size}`);

export const getProductById = (id) => api.get(`/products/id/${id}`);

export const getProductBySku = (sku) => api.get(`/products/sku/${sku}`);

export const createProduct = (data) => api.post('/products/create', data);

export const updateProduct = (id, data) => api.put(`/products/id/${id}`, data);

export const deleteProduct = (id) => api.delete(`/products/id/${id}`);