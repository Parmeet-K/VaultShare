import http from 'http';
import { Server } from 'socket.io';
import { app } from './app.js';
import { connectDatabase } from './config/db.js';
import { env } from './config/env.js';
import { authenticateSocket } from './sockets/auth.socket.js';
import { registerActivitySocket } from './sockets/activity.socket.js';
import { setSocketServer } from './services/socket.service.js';
import { logger } from './utils/logger.js';

const server = http.createServer(app);
export const io = new Server(server, { cors: { origin: env.clientUrl, credentials: true } });
setSocketServer(io);
io.use(authenticateSocket);
io.on('connection', registerActivitySocket);

await connectDatabase();
server.listen(env.port, () => logger.info(`VaultShare API running on port ${env.port}`));
process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled rejection', reason);
  server.close(() => process.exit(1));
});
