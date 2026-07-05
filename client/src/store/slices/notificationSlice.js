import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { api } from '../../lib/api.js';

export const fetchNotifications = createAsyncThunk('notifications/fetch', async () => (await api.get('/notifications')).data);

const slice = createSlice({ 
  name: 'notifications', 
  initialState: { items: [] }, 
  reducers: { 
    pushed: (s, a) => { 
      s.items.unshift(a.payload); 
    },
    markAllAsRead: (s) => {
      s.items.forEach(n => {
        if (!n.readAt) n.readAt = new Date().toISOString();
      });
    }
  }, 
  extraReducers: (b) => b.addCase(fetchNotifications.fulfilled, (s, a) => { 
    s.items = a.payload.notifications; 
  }) 
});

export const { pushed, markAllAsRead } = slice.actions;
export default slice.reducer;