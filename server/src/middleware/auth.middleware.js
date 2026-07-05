import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { Session } from '../models/Session.js';
import { User } from '../models/User.js';
import { AppError } from '../utils/AppError.js';

export async function protect(req, _res, next) {
  const header = req.headers.authorization;
  const token = header?.startsWith('Bearer ') ? header.slice(7) : req.cookies.accessToken;
  if (!token) return next(new AppError('Authentication required', 401, 'AUTH_REQUIRED'));

  try {
    const decoded = jwt.verify(token, env.jwtAccessSecret);
    const user = await User.findById(decoded.sub).select('+twoFactor.secret');
    if (!user || user.status !== 'active') return next(new AppError('Account unavailable', 401, 'ACCOUNT_UNAVAILABLE'));
    const session = await Session.findOne({ _id: decoded.sid, user: user._id, revokedAt: null });
    if (!session) return next(new AppError('Session expired', 401, 'SESSION_EXPIRED'));
    req.user = user;
    req.session = session;
    next();
  } catch {
    next(new AppError('Invalid or expired token', 401, 'INVALID_TOKEN'));
  }
}

export function authorize(...roles) {
  return (req, _res, next) => {
    if (!roles.includes(req.user.role)) return next(new AppError('Insufficient permissions', 403, 'FORBIDDEN'));
    next();
  };
}
