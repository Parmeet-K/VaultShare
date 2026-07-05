import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { api } from '../../lib/api.js';
export const fetchWorkspaces = createAsyncThunk('workspace/fetch', async () => (await api.get('/workspaces')).data);
export const createWorkspace = createAsyncThunk('workspace/create', async (payload) => (await api.post('/workspaces', payload)).data);
const slice = createSlice({ name: 'workspace', initialState: { teams: [], active: null, presence: {}, status: 'idle' }, reducers: { setActiveWorkspace: (s, a) => { s.active = a.payload; }, presenceUpdated: (s, a) => { s.presence[a.payload.user] = a.payload; } }, extraReducers: (b) => b
  .addCase(fetchWorkspaces.fulfilled, (s, a) => { s.teams = a.payload.teams; s.status = 'ready'; })
  .addCase(createWorkspace.fulfilled, (s, a) => { s.teams.unshift(a.payload.team); s.active = a.payload.team; }) });
export const { setActiveWorkspace, presenceUpdated } = slice.actions;
export default slice.reducer;