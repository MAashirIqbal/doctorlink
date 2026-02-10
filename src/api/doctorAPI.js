import API from './axios';

// Public
export const getDoctors = (params) => API.get('/doctors', { params });
export const getDoctor = (id) => API.get(`/doctors/${id}`);
export const getDoctorSlots = (id, params) => API.get(`/doctors/${id}/slots`, { params });
export const getDoctorReviews = (doctorId) => API.get(`/reviews/doctor/${doctorId}`);

// Doctor Apply
export const applyDoctor = (data) => API.post('/doctors/apply', data);
export const doctorLogin = (data) => API.post('/doctors/login', data);

// Authenticated doctor
export const getMyDoctorProfile = () => API.get('/doctors/me/profile');
export const updateMyDoctorProfile = (data) => API.put('/doctors/me/profile', data);
export const updateMySchedule = (data) => API.put('/doctors/me/schedule', data);
export const getDoctorDashboard = () => API.get('/doctors/me/dashboard');
export const getMyPatients = () => API.get('/doctors/me/patients');
export const getMyEarnings = () => API.get('/doctors/me/earnings');
