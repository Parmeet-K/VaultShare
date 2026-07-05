import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export function signAccessToken(user, session) {
  return jwt.sign({ sub: user._id.toString(), sid: session._id.toString(), role: user.role }, env.jwtAccessSecret, { expiresIn: '15m' });
}

export function signRefreshToken(user, session) {
  return jwt.sign({ sub: user._id.toString(), sid: session._id.toString() }, env.jwtRefreshSecret, { expiresIn: '30d' });
}

export function createOpaqueToken(bytes = 32) {
  return crypto.randomBytes(bytes).toString('base64url');
}
