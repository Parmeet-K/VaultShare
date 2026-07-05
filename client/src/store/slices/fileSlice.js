import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { api } from '../../lib/api.js';
export const fetchFiles = createAsyncThunk('files/fetch', async (params) => (await api.get('/files', { params })).data);
export const uploadFiles = createAsyncThunk('files/upload', async ({ files, workspace }, { dispatch }) => {
  const form = new FormData();
  files.forEach((file) => form.append('files', file));
  if (workspace) form.append('workspace', workspace);
  return (await api.post('/files/upload', form, { onUploadProgress: (e) => dispatch(setProgress(e.total ? Math.round((e.loaded * 100) / e.total) : 0)) })).data;
});
export const deleteFile = createAsyncThunk('files/delete', async (id) => { await api.delete(`/files/${id}`); return id; });
const slice = createSlice({ name: 'files', initialState: { items: [], view: 'grid', progress: 0, status: 'idle', selected: null, error: null }, reducers: { setView: (s, a) => { s.view = a.payload; }, selectFile: (s, a) => { s.selected = a.payload; }, setProgress: (s, a) => { s.progress = a.payload; }, optimisticFavorite: (s, a) => { const f = s.items.find((x) => x._id === a.payload); if (f) f.favorite = !f.favorite; } }, extraReducers: (b) => b
  .addCase(fetchFiles.fulfilled, (s, a) => { s.items = a.payload.files; s.status = 'ready'; })
  .addCase(uploadFiles.pending, (s) => { s.status = 'uploading'; s.error = null; })
  .addCase(uploadFiles.fulfilled, (s, a) => { s.items.unshift(...a.payload.files); s.progress = 0; s.status = 'ready'; })
  .addCase(uploadFiles.rejected, (s, a) => { s.status = 'error'; s.error = a.error.message; s.progress = 0; })
  .addCase(deleteFile.fulfilled, (s, a) => { s.items = s.items.filter((f) => f._id !== a.payload); }) });
export const { setView, selectFile, setProgress, optimisticFavorite } = slice.actions;
export default slice.reducer;