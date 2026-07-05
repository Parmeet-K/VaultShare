import mongoose from 'mongoose';

const ShareSchema = new mongoose.Schema(
  {
    file: { type: mongoose.Schema.Types.ObjectId, ref: 'File', required: true, index: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    recipients: [{ email: String, user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' } }],
    tokenHash: { type: String, required: true, unique: true },
    permission: { type: String, enum: ['view', 'download', 'edit', 'admin'], default: 'view' },
    expiresAt: Date,
    downloadLimit: Number,
    downloads: { type: Number, default: 0 },
    oneTime: { type: Boolean, default: false },
    passwordHash: { type: String, select: false },
    watermark: { type: Boolean, default: true },
    disabledAt: Date,
    accessLog: [
      {
        ip: String,
        userAgent: String,
        action: String,
        createdAt: { type: Date, default: Date.now }
      }
    ]
  },
  { timestamps: true }
);

export const Share = mongoose.model('Share', ShareSchema);
