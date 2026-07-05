import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { api } from '../../lib/api.js';

function apiError(error) {
  return error.response?.data?.message || error.message || 'Request failed';
}

export const login = createAsyncThunk('auth/login', async (payload, { rejectWithValue }) => {
  try { return (await api.post('/auth/login', payload)).data; } catch (error) { return rejectWithValue(apiError(error)); }
});
export const register = createAsyncThunk('auth/register', async (payload, { rejectWithValue }) => {
  try { return (await api.post('/auth/register', payload)).data; } catch (error) { return rejectWithValue(apiError(error)); }
});
export const refreshSession = createAsyncThunk('auth/refresh', async (_payload, { rejectWithValue }) => {
  try { return (await api.post('/auth/refresh')).data; } catch (error) { return rejectWithValue(apiError(error)); }
});
export const loadMe = createAsyncThunk('auth/me', async (_, { rejectWithValue }) => {
  try { return (await api.get('/auth/me')).data; } catch (error) { return rejectWithValue(apiError(error)); }
});
export const logout = createAsyncThunk('auth/logout', async () => (await api.post('/auth/logout')).data);

const slice = createSlice({
  name: 'auth',
  initialState: { user: null, accessToken: null, status: 'idle', error: null },
  reducers: {
    signedOut: (s) => { s.user = null; s.accessToken = null; s.status = 'idle'; },
    clearAuthError: (s) => { s.error = null; if (s.status === 'error') s.status = 'idle'; }
  },
  extraReducers: (b) => b
    .addCase(login.fulfilled, (s, a) => { s.user = a.payload.user; s.accessToken = a.payload.accessToken; s.status = 'ready'; s.error = null; })
    .addCase(register.fulfilled, (s, a) => { s.user = a.payload.user; s.status = 'registered'; s.error = null; })
    .addCase(refreshSession.fulfilled, (s, a) => { s.user = a.payload.user; s.accessToken = a.payload.accessToken; s.error = null; })
    .addCase(loadMe.fulfilled, (s, a) => { s.user = a.payload.user; s.error = null; })
    .addCase(loadMe.rejected, (s) => { s.user = null; })
    .addCase(logout.fulfilled, (s) => { s.user = null; s.accessToken = null; s.status = 'idle'; s.error = null; })
    .addMatcher((a) => a.type.startsWith('auth/') && a.type.endsWith('/pending') && !a.meta?.arg?.silent, (s) => { s.status = 'loading'; s.error = null; })
    .addMatcher((a) => a.type.startsWith('auth/') && a.type.endsWith('/rejected') && !a.type.includes('/me/') && !a.meta?.arg?.silent, (s, a) => { s.status = 'error'; s.error = a.payload || a.error.message; })
});
export const { signedOut, clearAuthError } = slice.actions;
export default slice.reducer;