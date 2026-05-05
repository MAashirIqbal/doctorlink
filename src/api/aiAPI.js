import API from './axios';

export const analyzeSymptoms = (formData) =>
    API.post('/ai/analyze-symptoms', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
