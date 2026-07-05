import { File } from '../models/File.js';
import { FileVersion } from '../models/FileVersion.js';
import { User } from '../models/User.js';
import { AppError } from '../utils/AppError.js';
import { audit } from '../services/audit.service.js';
import { simulateFileIntelligence } from '../services/ai.service.js';
import { encryptBuffer, decryptBuffer } from '../services/encryption.service.js';
import { readEncryptedObject, saveEncryptedObject } from '../services/storage.service.js';

export async function listFiles(req, res, next) {
  try {
    const query = { owner: req.user._id, deletedAt: null };
    if (req.query.folder) query.folder = req.query.folder;
    if (req.query.workspace) query.workspace = req.query.workspace;
    if (req.query.q) query.$text = { $search: req.query.q };
    const files = await File.find(query).sort(req.query.sort || '-createdAt').limit(Number(req.query.limit || 50));
    res.json({ files });
  } catch (error) { next(error); }
}

export async function uploadFiles(req, res, next) {
  try {
    const uploaded = [];
    for (const file of req.files) {
      const intel = simulateFileIntelligence(file);
      const encryptedPayload = encryptBuffer(file.buffer);
      const storageKey = await saveEncryptedObject(encryptedPayload.encrypted);
      const doc = await File.create({ owner: req.user._id, workspace: req.body.workspace || undefined, folder: req.body.folder || undefined, name: req.body.name || file.originalname, originalName: file.originalname, mimeType: file.mimetype, size: file.size, storageKey, checksum: encryptedPayload.checksum, encryption: encryptedPayload.metadata, tags: intel.tags, aiSummary: intel.summary, ocrText: intel.ocrText, malwareStatus: 'clean' });
      await FileVersion.create({ file: doc._id, createdBy: req.user._id, version: 1, storageKey, size: file.size, checksum: doc.checksum, encryption: doc.encryption, note: 'Initial upload' });
      await User.updateOne({ _id: req.user._id }, { $inc: { storageUsed: file.size } });
      await audit({ actor: req.user._id, file: doc._id, workspace: doc.workspace, action: 'file.upload', req, metadata: { size: file.size } });
      uploaded.push(doc);
    }
    res.status(201).json({ files: uploaded });
  } catch (error) { next(error); }
}

export async function getFile(req, res, next) {
  try {
    const file = await File.findOne({ _id: req.params.id, owner: req.user._id, deletedAt: null });
    if (!file) throw new AppError('File not found', 404, 'FILE_NOT_FOUND');
    res.json({ file });
  } catch (error) { next(error); }
}

export async function downloadFile(req, res, next) {
  try {
    const file = await File.findOne({ _id: req.params.id, owner: req.user._id, deletedAt: null });
    if (!file) throw new AppError('File not found', 404, 'FILE_NOT_FOUND');
    const encrypted = await readEncryptedObject(file.storageKey);
    const decrypted = decryptBuffer(encrypted, file.encryption);
    await audit({ actor: req.user._id, file: file._id, workspace: file.workspace, action: 'file.download', req });
    res.setHeader('Content-Type', file.mimeType);
    res.setHeader('Content-Disposition', `attachment; filename="${file.originalName}"`);
    res.send(decrypted);
  } catch (error) { next(error); }
}

export async function updateFile(req, res, next) {
  try {
    const file = await File.findOneAndUpdate({ _id: req.params.id, owner: req.user._id }, { $set: req.body }, { new: true, runValidators: true });
    if (!file) throw new AppError('File not found', 404, 'FILE_NOT_FOUND');
    await audit({ actor: req.user._id, file: file._id, action: 'file.update', req });
    res.json({ file });
  } catch (error) { next(error); }
}

export async function deleteFile(req, res, next) {
  try {
    const file = await File.findOneAndUpdate({ _id: req.params.id, owner: req.user._id }, { deletedAt: new Date() }, { new: true });
    if (!file) throw new AppError('File not found', 404, 'FILE_NOT_FOUND');
    await audit({ actor: req.user._id, file: file._id, action: 'file.delete', req });
    res.json({ message: 'File moved to secure trash' });
  } catch (error) { next(error); }
}

export async function versions(req, res, next) {
  try { res.json({ versions: await FileVersion.find({ file: req.params.id }).sort('-version') }); } catch (error) { next(error); }
}
