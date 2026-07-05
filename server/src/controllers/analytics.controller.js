import { ActivityLog } from '../models/ActivityLog.js';
import { File } from '../models/File.js';
import { Share } from '../models/Share.js';

export async function analytics(req, res, next) {
  try {
    const [files, shares, activity, storage] = await Promise.all([
      File.countDocuments({ owner: req.user._id, deletedAt: null }),
      Share.countDocuments({ owner: req.user._id, disabledAt: null }),
      ActivityLog.find({ actor: req.user._id }).sort('-createdAt').limit(20),
      File.aggregate([{ $match: { owner: req.user._id, deletedAt: null } }, { $group: { _id: '$mimeType', bytes: { $sum: '$size' }, count: { $sum: 1 } } }])
    ]);
    res.json({ stats: { files, shares, downloads: activity.filter((a) => a.action.includes('download')).length }, activity, storage });
  } catch (error) { next(error); }
}
