export function registerActivitySocket(socket) {
  socket.join(`user:${socket.user._id}`);
  socket.on('workspace:join', (workspaceId) => socket.join(`workspace:${workspaceId}`));
  socket.on('presence:update', (payload) => socket.broadcast.emit('presence:update', { user: socket.user._id, ...payload }));
}
