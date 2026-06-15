import api from './api';

export const adjustStock = (data) => api.post('/transactions/adjust', data);

export const getTransactionHistory = (page = 0, size = 20) => {
  return api.get(`/transactions/history`, {
    params: { page, size }
  });
};


export const getProductHistory = (productId, page = 0, size = 10) => {
  return api.get(`/transactions/product/${productId}`, {
    params: { page, size }
  });
};


export const getFilteredTransactions = (filters = {}, page = 0, size = 20) => {
  // Discards empty fields to ensure crisp URL query mapping
  const cleanParams = Object.fromEntries(
    Object.entries(filters).filter(([_, value]) => value !== '' && value !== null)
  );

  return api.get('/transactions/filter', {
    params: {
      page,
      size,
      ...cleanParams
    }
  });
};

export const getExportCsvUrl = (filters = {}) => {
  const cleanParams = Object.fromEntries(
    Object.entries(filters).filter(([_, value]) => value !== '' && value !== null)
  );
  
  const queryString = new URLSearchParams(cleanParams).toString();
  const baseUrl = api.defaults.baseURL || 'http://localhost:8080/api';
  
  return `${baseUrl}/transactions/export${queryString ? `?${queryString}` : ''}`;
};