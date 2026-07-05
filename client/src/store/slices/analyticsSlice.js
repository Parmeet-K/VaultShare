import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { api } from '../../lib/api.js';
export const fetchAnalytics = createAsyncThunk('analytics/fetch', async () => (await api.get('/analytics')).data);
const slice = createSlice({ name: 'analytics', initialState: { stats: {}, activity: [], storage: [] }, reducers: {}, extraReducers: (b) => b.addCase(fetchAnalytics.fulfilled, (s, a) => { s.stats = a.payload.stats; s.activity = a.payload.activity; s.storage = a.payload.storage; }) });
export default slice.reducer;
