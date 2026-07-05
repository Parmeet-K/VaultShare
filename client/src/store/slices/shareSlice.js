import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { api } from '../../lib/api.js';
export const fetchShares = createAsyncThunk('sharing/fetch', async () => (await api.get('/shares')).data);
export const createShare = createAsyncThunk('sharing/create', async (payload) => (await api.post('/shares', payload)).data);
export const revokeShare = createAsyncThunk('sharing/revoke', async (id) => { await api.delete(`/shares/${id}`); return id; });
const slice = createSlice({ name: 'sharing', initialState: { items: [], latest: null, status: 'idle' }, reducers: {}, extraReducers: (b) => b
  .addCase(fetchShares.fulfilled, (s, a) => { s.items = a.payload.shares; })
  .addCase(createShare.fulfilled, (s, a) => { s.latest = a.payload; s.items.unshift(a.payload.share); })
  .addCase(revokeShare.fulfilled, (s, a) => { s.items = s.items.filter((share) => share._id !== a.payload); }) });
export default slice.reducer;