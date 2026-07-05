import mongoose from 'mongoose';

const FileSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    workspace: { type: mongoose.Schema.Types.ObjectId, ref: 'Team' },
    folder: { type: mongoose.Schema.Types.ObjectId, ref: 'Folder' },
    name: { type: String, required: true },
    originalName: { type: String, required: true },
    mimeType: { type: String, required: true },
    size: { type: Number, required: true },
    storageProvider: { type: String, enum: ['local-encrypted', 'cloudinary', 's3'], default: 'local-encrypted' },
    storageKey: { type: String, required: true },
    checksum: { type: String, required: true },
    encryption: {
      algorithm: { type: String, default: 'aes-256-gcm' },
      encryptedKey: { type: String, required: true },
      iv: { type: String, required: true },
      authTag: { type: String, required: true }
    },
    visibility: { type: String, enum: ['private', 'public'], default: 'private' },
    tags: [{ type: String, index: true }],
    aiSummary: String,
    ocrText: String,
    duplicateOf: { type: mongoose.Schema.Types.ObjectId, ref: 'File' },
    malwareStatus: { type: String, enum: ['pending', 'clean', 'flagged'], default: 'pending' },
    favoriteBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    deletedAt: Date
  },
  { timestamps: true }
);

FileSchema.index({ name: 'text', originalName: 'text', tags: 'text', aiSummary: 'text', ocrText: 'text' });

export const File = mongoose.model('File', FileSchema);
