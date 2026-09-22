import API from './axios';

export const createReview = (data) => API.post('/reviews', data);
export const getDoctorReviews = (doctorId) => API.get(`/reviews/doctor/${doctorId}`);
