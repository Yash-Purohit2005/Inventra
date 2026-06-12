import api from './api';

export const getSuppliers = () => api.get('/suppliers/get-all-supplier');