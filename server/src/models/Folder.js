import mongoose from 'mongoose';

const FolderSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    workspace: { type: mongoose.Schema.Types.ObjectId, ref: 'Team' },
    parent: { type: mongoose.Schema.Types.ObjectId, ref: 'Folder' },
    name: { type: String, required: true, trim: true },
    path: { type: String, default: '/' },
    color: { type: String, default: '#38bdf8' }
  },
  { timestamps: true }
);

FolderSchema.index({ owner: 1, parent: 1, name: 1 }, { unique: true });

export const Folder = mongoose.model('Folder', FolderSchema);
