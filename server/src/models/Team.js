import mongoose from 'mongoose';

const TeamSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    members: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        role: { type: String, enum: ['viewer', 'editor', 'admin'], default: 'viewer' }
      }
    ],
    storageLimit: { type: Number, default: 100 * 1024 * 1024 * 1024 }
  },
  { timestamps: true }
);

export const Team = mongoose.model('Team', TeamSchema);
