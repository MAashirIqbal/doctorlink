import API from './axios';

// Patient
export const createAppointment = (data) => API.post('/appointments', data);
export const getMyAppointments = (params) => API.get('/appointments/my', { params });
export const getAppointmentDetail = (id) => API.get(`/appointments/${id}`);
export const cancelAppointment = (id, data) => API.put(`/appointments/${id}/cancel`, data);
export const getPatientDashboard = () => API.get('/appointments/dashboard');

// Doctor
export const getDoctorAppointments = (params) => API.get('/appointments/doctor', { params });
export const acceptAppointment = (id) => API.put(`/appointments/${id}/accept`);
export const rejectAppointment = (id, data) => API.put(`/appointments/${id}/reject`, data);
export const completeAppointment = (id) => API.put(`/appointments/${id}/complete`);
