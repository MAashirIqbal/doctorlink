import API from './axios';

export const listConversations = () => API.get('/messages/conversations');
export const getThread = (withId) => API.get('/messages/thread', { params: { with: withId } });
export const sendMessage = (data) => API.post('/messages', data);
export const markThreadRead = (withId) => API.put('/messages/read', null, { params: { with: withId } });
export const getUnreadCount = () => API.get('/messages/unread-count');
