import { Team } from '../models/Team.js';
import { audit } from '../services/audit.service.js';

export async function listTeams(req, res, next) { try { res.json({ teams: await Team.find({ $or: [{ owner: req.user._id }, { 'members.user': req.user._id }] }) }); } catch (e) { next(e); } }
export async function createTeam(req, res, next) { try { const slug = req.body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); const team = await Team.create({ name: req.body.name, slug: `${slug}-${Date.now()}`, owner: req.user._id, members: [{ user: req.user._id, role: 'admin' }] }); await audit({ actor: req.user._id, workspace: team._id, action: 'team.create', req }); res.status(201).json({ team }); } catch (e) { next(e); } }
export async function inviteMember(req, res, next) { try { const team = await Team.findOneAndUpdate({ _id: req.params.id, owner: req.user._id }, { $addToSet: { members: { user: req.body.userId, role: req.body.role || 'viewer' } } }, { new: true }); await audit({ actor: req.user._id, workspace: team._id, action: 'team.invite', req }); res.json({ team }); } catch (e) { next(e); } }
