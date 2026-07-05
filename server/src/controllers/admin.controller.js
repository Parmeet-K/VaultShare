import { ActivityLog } from '../models/ActivityLog.js';
import { File } from '../models/File.js';
import { Share } from '../models/Share.js';
import { User } from '../models/User.js';
export async function adminOverview(_req, res, next) { try { const [users, files, shares, logs] = await Promise.all([User.countDocuments(), File.countDocuments(), Share.countDocuments(), ActivityLog.find().sort('-createdAt').limit(40).populate('actor', 'name email')]); res.json({ stats: { users, files, shares }, logs }); } catch (e) { next(e); } }
export async function updateUser(req, res, next) { try { res.json({ user: await User.findByIdAndUpdate(req.params.id, req.body, { new: true }) }); } catch (e) { next(e); } }
