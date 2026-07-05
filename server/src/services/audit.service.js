import { ActivityLog } from '../models/ActivityLog.js';
import { Notification } from '../models/Notification.js';
import { emitToUser, emitToWorkspace } from './socket.service.js';

const titles = {
  'auth.login': 'New sign-in',
  'auth.register': 'Account created',
  'auth.session_revoke': 'Session revoked',
  'file.upload': 'File uploaded',
  'file.download': 'File downloaded',
  'file.delete': 'File deleted',
  'share.create': 'Share link created',
  'share.revoke': 'Share link revoked',
  'share.preview': 'Shared file viewed',
  'share.download': 'Shared file downloaded',
  'team.create': 'Workspace created'
};

export async function audit({ actor, file, workspace, action, req, metadata = {} }) {
  const log = await ActivityLog.create({ actor, file, workspace, action, ip: req?.ip, userAgent: req?.headers?.['user-agent'], metadata });
  if (actor) {
    const notification = await Notification.create({ user: actor, type: action, title: titles[action] || 'VaultShare activity', body: titles[action] || action, metadata: { file, workspace, ...metadata } });
    emitToUser(actor, 'activity:new', log);
    emitToUser(actor, 'notification:new', notification);
  }
  if (workspace) emitToWorkspace(workspace, 'activity:new', log);
  return log;
}