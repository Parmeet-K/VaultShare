import mongoose from 'mongoose';

const FileVersionSchema = new mongoose.Schema(
  {
    file: { type: mongoose.Schema.Types.ObjectId, ref: 'File', required: true, index: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    version: { type: Number, required: true },
    storageKey: { type: String, required: true },
    size: Number,
    checksum: String,
    encryption: {
      encryptedKey: String,
      iv: String,
      authTag: String
    },
    note: String
  },
  { timestamps: true }
);

export const FileVersion = mongoose.model('FileVersion', FileVersionSchema);
