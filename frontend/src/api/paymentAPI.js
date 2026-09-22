import API from './axios';

export const createCheckout = (data) => API.post('/payments/create-checkout', data);
export const verifySession = (data) => API.post('/payments/verify-session', data);
export const simulatePayment = (data) => API.post('/payments/simulate', data);
export const getMyPayments = () => API.get('/payments/my');
