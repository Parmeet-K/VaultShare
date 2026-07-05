import mongoose from 'mongoose';

const ActivityLogSchema = new mongoose.Schema(
  {
    actor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
    file: { type: mongoose.Schema.Types.ObjectId, ref: 'File', index: true },
    workspace: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', index: true },
    action: { type: String, required: true },
    ip: String,
    userAgent: String,
    metadata: mongoose.Schema.Types.Mixed
  },
  { timestamps: true }
);

export const ActivityLog = mongoose.model('ActivityLog', ActivityLogSchema);
