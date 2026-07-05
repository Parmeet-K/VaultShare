import { Folder } from '../models/Folder.js';
import { audit } from '../services/audit.service.js';

export async function listFolders(req, res, next) { try { res.json({ folders: await Folder.find({ owner: req.user._id, parent: req.query.parent || null }).sort('name') }); } catch (e) { next(e); } }
export async function createFolder(req, res, next) { try { const folder = await Folder.create({ owner: req.user._id, parent: req.body.parent || null, name: req.body.name, workspace: req.body.workspace, color: req.body.color }); await audit({ actor: req.user._id, workspace: folder.workspace, action: 'folder.create', req }); res.status(201).json({ folder }); } catch (e) { next(e); } }
export async function updateFolder(req, res, next) { try { const folder = await Folder.findOneAndUpdate({ _id: req.params.id, owner: req.user._id }, req.body, { new: true }); res.json({ folder }); } catch (e) { next(e); } }
export async function deleteFolder(req, res, next) { try { await Folder.deleteOne({ _id: req.params.id, owner: req.user._id }); await audit({ actor: req.user._id, action: 'folder.delete', req }); res.json({ message: 'Folder deleted' }); } catch (e) { next(e); } }
