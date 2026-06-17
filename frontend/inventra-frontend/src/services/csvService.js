import api from './api';

export const importCsv = (file, operator) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('operator', operator);
  return api.post('/csv/import', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const getImportHistory = () => api.get('/csv/import/history');

export const downloadErrorReport = async (importJobId) => {
  const response = await api.get(`/csv/import/errors/${importJobId}`, {
    responseType: 'blob', // Tells Axios to handle the response as binary data
  });

  // Create a temporary URL object from the blob data
  const blob = new Blob([response.data], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  
  // Create a temporary hidden link and trigger the download
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `error_report_job_${importJobId}.csv`);
  document.body.appendChild(link);
  link.click();
  
  // Clean up
  link.parentNode.removeChild(link);
  window.URL.revokeObjectURL(url);
};