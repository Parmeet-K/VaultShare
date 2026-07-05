let io;
export function setSocketServer(server) { io = server; }
export function emitToUser(userId, event, payload) { io?.to(`user:${userId}`).emit(event, payload); }
export function emitToWorkspace(workspaceId, event, payload) { io?.to(`workspace:${workspaceId}`).emit(event, payload); }
