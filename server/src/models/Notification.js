import mongoose from 'mongoose';

const NotificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: { type: String, required: true },
    title: { type: String, required: true },
    body: String,
    metadata: mongoose.Schema.Types.Mixed,
    readAt: Date
  },
  { timestamps: true }
);

export const Notification = mongoose.model('Notification', NotificationSchema);
