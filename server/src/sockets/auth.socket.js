import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { User } from '../models/User.js';
export async function authenticateSocket(socket, next) {
  try {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error('Socket auth required'));
    const decoded = jwt.verify(token, env.jwtAccessSecret);
    const user = await User.findById(decoded.sub);
    if (!user) return next(new Error('Invalid socket user'));
    socket.user = user;
    next();
  } catch { next(new Error('Invalid socket token')); }
}
