import API from './axios';

export const getAdminDashboard = () => API.get('/admin/dashboard');

// Doctors
export const getAllDoctors = (params) => API.get('/admin/doctors', { params });
export const getPendingDoctors = () => API.get('/admin/doctors/pending');
export const approveDoctor = (id) => API.put(`/admin/doctors/${id}/approve`);
export const rejectDoctor = (id) => API.put(`/admin/doctors/${id}/reject`);
export const editDoctor = (id, data) => API.put(`/admin/doctors/${id}`, data);

// Users
export const getAllUsers = (params) => API.get('/admin/users', { params });
export const blockUser = (id) => API.put(`/admin/users/${id}/block`);
export const unblockUser = (id) => API.put(`/admin/users/${id}/unblock`);

// Appointments
export const getAllAppointments = (params) => API.get('/admin/appointments', { params });
export const overrideAppointmentStatus = (id, data) => API.put(`/admin/appointments/${id}/status`, data);

// Payments
export const getAllPayments = (params) => API.get('/admin/payments', { params });

// Reports
export const getReports = () => API.get('/admin/reports');

// Settings
export const getSettings = () => API.get('/admin/settings');
export const updateSettings = (data) => API.put('/admin/settings', data);
