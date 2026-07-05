import multer from 'multer';
import { AppError } from '../utils/AppError.js';

const allowedTypes = [
  'image/png',
  'image/jpeg',
  'image/webp',
  'application/pdf',
  'text/plain',
  'application/zip',
  'video/mp4',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
];

export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 1024 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!allowedTypes.includes(file.mimetype)) return cb(new AppError('Unsupported file type', 415, 'UNSUPPORTED_FILE'));
    cb(null, true);
  }
});
