import API from './axios';

// Patient
export const createAppointment = (data) => API.post('/appointments', data);
export const getMyAppointments = (params) => API.get('/appointments/my', { params });
export const getAppointmentDetail = (id) => API.get(`/appointments/${id}`);
export const cancelAppointment = (id, data) => API.put(`/appointments/${id}/cancel`, data);
export const getPatientDashboard = () => API.get('/appointments/dashboard');
export const rescheduleAppointment = (id, data) => API.put(`/appointments/${id}/reschedule`, data);

// Doctor
export const getDoctorAppointments = (params) => API.get('/appointments/doctor', { params });
export const acceptAppointment = (id) => API.put(`/appointments/${id}/accept`);
export const rejectAppointment = (id, data) => API.put(`/appointments/${id}/reject`, data);
export const completeAppointment = (id) => API.put(`/appointments/${id}/complete`);
export const markNoShow = (id) => API.put(`/appointments/${id}/no-show`);
export const acceptReschedule = (id) => API.put(`/appointments/${id}/reschedule/accept`);
export const rejectReschedule = (id) => API.put(`/appointments/${id}/reschedule/reject`);
export const getDoctorNoShows = () => API.get('/appointments/doctor/no-shows');

// Prescription (doctor)
export const uploadPrescription = (id, formData) =>
    API.post(`/appointments/${id}/prescription`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });

// Referral (doctor)
export const referAppointment = (id, data) => API.post(`/appointments/${id}/refer`, data);
