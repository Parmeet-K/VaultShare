import crypto from 'crypto';
import { env } from '../config/env.js';

const masterKey = Buffer.from(env.encryptionMasterKey, 'hex');

export function encryptBuffer(buffer) {
  const fileKey = crypto.randomBytes(32);
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', fileKey, iv);
  const encrypted = Buffer.concat([cipher.update(buffer), cipher.final()]);
  const authTag = cipher.getAuthTag();

  const keyIv = crypto.randomBytes(12);
  const keyCipher = crypto.createCipheriv('aes-256-gcm', masterKey, keyIv);
  const encryptedKey = Buffer.concat([keyCipher.update(fileKey), keyCipher.final()]);
  const keyTag = keyCipher.getAuthTag();

  return {
    encrypted,
    checksum: crypto.createHash('sha256').update(buffer).digest('hex'),
    metadata: {
      encryptedKey: Buffer.concat([keyIv, keyTag, encryptedKey]).toString('base64'),
      iv: iv.toString('base64'),
      authTag: authTag.toString('base64')
    }
  };
}

export function decryptBuffer(encrypted, metadata) {
  const wrapped = Buffer.from(metadata.encryptedKey, 'base64');
  const keyIv = wrapped.subarray(0, 12);
  const keyTag = wrapped.subarray(12, 28);
  const encryptedKey = wrapped.subarray(28);
  const keyDecipher = crypto.createDecipheriv('aes-256-gcm', masterKey, keyIv);
  keyDecipher.setAuthTag(keyTag);
  const fileKey = Buffer.concat([keyDecipher.update(encryptedKey), keyDecipher.final()]);
  const decipher = crypto.createDecipheriv('aes-256-gcm', fileKey, Buffer.from(metadata.iv, 'base64'));
  decipher.setAuthTag(Buffer.from(metadata.authTag, 'base64'));
  return Buffer.concat([decipher.update(encrypted), decipher.final()]);
}
