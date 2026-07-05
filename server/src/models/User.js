import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';

const LoginActivitySchema = new mongoose.Schema({
  ip: String,
  userAgent: String,
  city: String,
  status: { type: String, enum: ['success', 'failed'], default: 'success' },
  createdAt: { type: Date, default: Date.now }
});

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, index: true },
    password: { type: String, required: true, select: false },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    status: { type: String, enum: ['pending', 'active', 'suspended'], default: 'pending' },
    avatar: String,
    storageUsed: { type: Number, default: 0 },
    storageLimit: { type: Number, default: 10 * 1024 * 1024 * 1024 },
    emailVerifiedAt: Date,
    passwordResetToken: { type: String, select: false },
    passwordResetExpires: { type: Date, select: false },
    twoFactor: {
      enabled: { type: Boolean, default: false },
      secret: { type: String, select: false }
    },
    preferences: {
      theme: { type: String, enum: ['light', 'dark', 'system'], default: 'dark' },
      locale: { type: String, default: 'en' }
    },
    loginActivity: [LoginActivitySchema]
  },
  { timestamps: true }
);

UserSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

UserSchema.methods.comparePassword = function comparePassword(candidate) {
  return bcrypt.compare(candidate, this.password);
};

export const User = mongoose.model('User', UserSchema);
