import api from './api';

export const authService = {
    // Register new user
    register: async (userData) => {
        const response = await api.post('/auth/register', userData);
        return response.data;
    },

    // Login user
    login: async (credentials) => {
        const response = await api.post('/auth/login', credentials);
        return response.data;
    },

    // Get current user profile
    getProfile: async () => {
        const response = await api.get('/auth/profile');
        return response.data;
    },

    // Update profile
    updateProfile: async (data) => {
        const response = await api.put('/auth/profile', data);
        return response.data;
    },
};

export const doctorService = {
    // Get all doctors with filters
    getDoctors: async (filters = {}) => {
        const response = await api.get('/doctors', { params: filters });
        return response.data;
    },

    // Get single doctor by ID
    getDoctor: async (id) => {
        const response = await api.get(`/doctors/${id}`);
        return response.data;
    },

    // Update doctor profile (for doctors only)
    updateDoctorProfile: async (data) => {
        const response = await api.put('/doctors/profile', data);
        return response.data;
    },

    // Set availability
    setAvailability: async (availabilityData) => {
        const response = await api.post('/doctors/availability', availabilityData);
        return response.data;
    },
};

export const appointmentService = {
    // Book appointment
    bookAppointment: async (appointmentData) => {
        const response = await api.post('/appointments', appointmentData);
        return response.data;
    },

    // Get user's appointments
    getMyAppointments: async () => {
        const response = await api.get('/appointments/my');
        return response.data;
    },

    // Get appointment by ID
    getAppointment: async (id) => {
        const response = await api.get(`/appointments/${id}`);
        return response.data;
    },

    // Cancel appointment
    cancelAppointment: async (id) => {
        const response = await api.delete(`/appointments/${id}`);
        return response.data;
    },

    // Doctor: Accept/Reject appointment
    updateAppointmentStatus: async (id, status) => {
        const response = await api.patch(`/appointments/${id}/status`, { status });
        return response.data;
    },
};

export const paymentService = {
    // Create Razorpay order
    createOrder: async (appointmentId) => {
        const response = await api.post('/payments/create-order', { appointmentId });
        return response.data;
    },

    // Verify payment
    verifyPayment: async (paymentData) => {
        const response = await api.post('/payments/verify', paymentData);
        return response.data;
    },
};

export const reviewService = {
    // Add review
    addReview: async (doctorId, reviewData) => {
        const response = await api.post(`/reviews/${doctorId}`, reviewData);
        return response.data;
    },

    // Get doctor reviews
    getDoctorReviews: async (doctorId) => {
        const response = await api.get(`/reviews/${doctorId}`);
        return response.data;
    },
};
