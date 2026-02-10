import API from './axios';

export const getAdminDashboard = () => API.get('/admin/dashboard');

// Doctors
export const getAllDoctors = (params) => API.get('/admin/doctors', { params });
export const getPendingDoctors = () => API.get('/admin/doctors/pending');
export const getDoctorDetail = (id) => API.get(`/admin/doctors/${id}/detail`);
export const approveDoctor = (id) => API.put(`/admin/doctors/${id}/approve`);
export const rejectDoctor = (id) => API.put(`/admin/doctors/${id}/reject`);
export const editDoctor = (id, data) => API.put(`/admin/doctors/${id}`, data);

// Patients / Users
export const getAllUsers = (params) => API.get('/admin/users', { params });
export const getUserDetail = (id) => API.get(`/admin/users/${id}`);
export const blockUser = (id) => API.put(`/admin/users/${id}/block`);
export const unblockUser = (id) => API.put(`/admin/users/${id}/unblock`);
export const resetUserPassword = (id, data) => API.put(`/admin/users/${id}/reset-password`, data);

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

// Announcements (admin)
export const getAnnouncements = () => API.get('/admin/announcements');
export const createAnnouncement = (data) => API.post('/admin/announcements', data);
export const updateAnnouncement = (id, data) => API.put(`/admin/announcements/${id}`, data);
export const deleteAnnouncement = (id) => API.delete(`/admin/announcements/${id}`);

// Announcements (public-facing)
export const getActiveAnnouncements = () => API.get('/announcements/active');
export const dismissAnnouncement = (id) => API.put(`/announcements/${id}/dismiss`);
