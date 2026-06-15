import api from './api';

export const getOpenAlerts = () => api.get('/alerts');

export const getAlertsByProduct = (productId) =>
  api.get(`/alerts/product/${productId}`);

export const resolveAlert = (productId, resolvedBy) =>
  api.patch(`/alerts/resolve/${productId}?resolvedBy=${encodeURIComponent(resolvedBy)}`);