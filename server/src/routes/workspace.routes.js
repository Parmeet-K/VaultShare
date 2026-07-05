import { Router } from 'express';
import { protect } from '../middleware/auth.middleware.js';
import { createTeam, inviteMember, listTeams } from '../controllers/workspace.controller.js';
export const workspaceRoutes = Router();
workspaceRoutes.use(protect);
workspaceRoutes.get('/', listTeams);
workspaceRoutes.post('/', createTeam);
workspaceRoutes.post('/:id/invite', inviteMember);
