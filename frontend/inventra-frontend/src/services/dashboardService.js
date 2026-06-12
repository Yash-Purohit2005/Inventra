import api from './api';

export const getDashboardSummary = () => api.get('/dashboard/summary');
export const getTopLowStock = () => api.get('/dashboard/top-low-stock');
export const getStockMovements = () => api.get('/dashboard/stock-movements');
export const getCategoryDistribution = () => api.get('/dashboard/category-distribution');
export const getSupplierPerformance = () => api.get('/dashboard/supplier-performance');