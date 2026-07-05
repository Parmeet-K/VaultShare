import mongoose from 'mongoose';

const SessionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    refreshTokenHash: { type: String, required: true },
    ip: String,
    userAgent: String,
    deviceName: String,
    lastSeenAt: { type: Date, default: Date.now },
    revokedAt: Date,
    suspicious: { type: Boolean, default: false }
  },
  { timestamps: true }
);

export const Session = mongoose.model('Session', SessionSchema);
