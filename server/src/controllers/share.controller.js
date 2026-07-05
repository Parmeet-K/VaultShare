import bcrypt from 'bcryptjs';
import QRCode from 'qrcode';
import { env } from '../config/env.js';
import { File } from '../models/File.js';
import { Share } from '../models/Share.js';
import { AppError } from '../utils/AppError.js';
import { audit } from '../services/audit.service.js';
import { createOpaqueToken, hashToken } from '../services/token.service.js';
import { decryptBuffer } from '../services/encryption.service.js';
import { readEncryptedObject } from '../services/storage.service.js';
import { sendMail } from '../services/mail.service.js';

export async function createShare(req, res, next) {
  try {
    const file = await File.findOne({ _id: req.body.fileId, owner: req.user._id, deletedAt: null });
    if (!file) throw new AppError('File not found', 404, 'FILE_NOT_FOUND');
    const rawToken = createOpaqueToken();
    const share = await Share.create({ file: file._id, owner: req.user._id, recipients: req.body.recipients || [], tokenHash: hashToken(rawToken), permission: req.body.permission || 'view', expiresAt: req.body.expiresAt || undefined, downloadLimit: req.body.downloadLimit, oneTime: Boolean(req.body.oneTime), passwordHash: req.body.password ? await bcrypt.hash(req.body.password, 12) : undefined, watermark: req.body.watermark !== false });
    const url = `${env.clientUrl}/share/${rawToken}`;
    const apiUrl = `${req.protocol}://${req.get('host')}/api/shares/public/${rawToken}`;
    const qr = await QRCode.toDataURL(url);
    await Promise.all((share.recipients || []).map((r) => r.email && sendMail({ to: r.email, subject: `${req.user.name} shared a secure file`, html: `<p>Open secure share: ${url}</p>` })));
    await audit({ actor: req.user._id, file: file._id, action: 'share.create', req, metadata: { permission: share.permission } });
    res.status(201).json({ share, token: rawToken, url, apiUrl, qr });
  } catch (error) { next(error); }
}

export async function myShares(req, res, next) {
  try { res.json({ shares: await Share.find({ owner: req.user._id, disabledAt: null }).populate('file').sort('-createdAt') }); } catch (error) { next(error); }
}

export async function revokeShare(req, res, next) {
  try {
    const share = await Share.findOneAndUpdate({ _id: req.params.id, owner: req.user._id }, { disabledAt: new Date() }, { new: true });
    if (!share) throw new AppError('Share not found', 404, 'SHARE_NOT_FOUND');
    await audit({ actor: req.user._id, file: share.file, action: 'share.revoke', req });
    res.json({ share });
  } catch (error) { next(error); }
}

export async function accessPublicShare(req, res, next) {
  try {
    const share = await Share.findOne({ tokenHash: hashToken(req.params.token), disabledAt: null }).select('+passwordHash').populate('file');
    if (!share) throw new AppError('Share not found', 404, 'SHARE_NOT_FOUND');
    if (share.expiresAt && share.expiresAt < new Date()) throw new AppError('Share expired', 410, 'SHARE_EXPIRED');
    if (share.downloadLimit && share.downloads >= share.downloadLimit) throw new AppError('Download limit reached', 429, 'DOWNLOAD_LIMIT');

    if (req.method === 'GET') {
      share.accessLog.push({ ip: req.ip, userAgent: req.headers['user-agent'], action: 'metadata' });
      await share.save();
      return res.json({ file: share.file, permission: share.permission, watermark: share.watermark, expiresAt: share.expiresAt, downloads: share.downloads, downloadLimit: share.downloadLimit, requiresPassword: Boolean(share.passwordHash) });
    }

    if (share.passwordHash && !(await bcrypt.compare(req.body.password || '', share.passwordHash))) throw new AppError('Share password required', 401, 'SHARE_PASSWORD_REQUIRED');

    const action = req.body.action === 'download' ? 'download' : 'preview';
    if (action === 'download' && !['download', 'edit', 'admin'].includes(share.permission)) throw new AppError('This link is view-only. Download is not allowed.', 403, 'DOWNLOAD_FORBIDDEN');
    if (action === 'preview' && !['view', 'download', 'edit', 'admin'].includes(share.permission)) throw new AppError('Preview not allowed', 403, 'PREVIEW_FORBIDDEN');

    const encrypted = await readEncryptedObject(share.file.storageKey);
    const decrypted = decryptBuffer(encrypted, share.file.encryption);
    share.accessLog.push({ ip: req.ip, userAgent: req.headers['user-agent'], action });
    if (action === 'download') {
      share.downloads += 1;
      if (share.oneTime) share.disabledAt = new Date();
    }
    await share.save();
    await audit({ actor: share.owner, file: share.file._id, action: `share.${action}`, req, metadata: { publicAccess: true } });
    res.setHeader('Content-Type', share.file.mimeType);
    res.setHeader('Content-Disposition', `${action === 'download' ? 'attachment' : 'inline'}; filename="${share.file.originalName}"`);
    res.send(decrypted);
  } catch (error) { next(error); }
}