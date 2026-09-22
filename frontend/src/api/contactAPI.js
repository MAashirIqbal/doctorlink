import API from './axios';

export const submitContactMessage = (data) => API.post('/contact', data);
export const getContactMessages = (params) => API.get('/contact', { params });
export const markContactMessageRead = (id) => API.put(`/contact/${id}/read`);
