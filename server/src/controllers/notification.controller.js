import { Notification } from '../models/Notification.js';
export async function listNotifications(req, res, next) { try { res.json({ notifications: await Notification.find({ user: req.user._id }).sort('-createdAt').limit(50) }); } catch (e) { next(e); } }
export async function markRead(req, res, next) { try { await Notification.updateMany({ user: req.user._id, _id: { $in: req.body.ids } }, { readAt: new Date() }); res.json({ message: 'Notifications marked read' }); } catch (e) { next(e); } }
