import { io } from 'socket.io-client';
let socket;
export function connectSocket(token, dispatch) {
  if (!token || socket?.connected) return socket;
  socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000', { auth: { token }, withCredentials: true });
  socket.on('activity:new', (payload) => dispatch({ type: 'notifications/pushed', payload: { id: payload._id, type: payload.action, title: 'Secure activity', body: payload.action, createdAt: payload.createdAt } }));
  socket.on('presence:update', (payload) => dispatch({ type: 'workspace/presenceUpdated', payload }));
  return socket;
}
export function joinWorkspace(id) { socket?.emit('workspace:join', id); }
