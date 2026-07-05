import { configureStore } from '@reduxjs/toolkit';
import auth from './slices/authSlice.js';
import files from './slices/fileSlice.js';
import sharing from './slices/shareSlice.js';
import notifications from './slices/notificationSlice.js';
import profile from './slices/profileSlice.js';
import workspace from './slices/workspaceSlice.js';
import analytics from './slices/analyticsSlice.js';
import theme from './slices/themeSlice.js';
import { setupApiInterceptors } from '../lib/api.js';

export const store = configureStore({ reducer: { auth, files, sharing, notifications, profile, workspace, analytics, theme } });
setupApiInterceptors(store);
