import { env } from '../config/env.js';
import { AppError } from '../utils/AppError.js';
import { logger } from '../utils/logger.js';

export function notFound(req, _res, next) {
  next(new AppError(`Route not found: ${req.originalUrl}`, 404, 'NOT_FOUND'));
}

export function errorHandler(err, _req, res, _next) {
  const statusCode = err.statusCode || err.status || 500;
  if (statusCode >= 500 || env.nodeEnv === 'development') logger.error(err.message, err.stack);
  res.status(statusCode).json({
    success: false,
    message: err.isOperational || env.nodeEnv === 'development' ? err.message : 'Unexpected server error',
    code: err.code || 'SERVER_ERROR'
  });
}