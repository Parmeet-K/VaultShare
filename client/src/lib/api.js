import axios from 'axios';
import { refreshSession, signedOut } from '../store/slices/authSlice.js';

export const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || '/api', withCredentials: true });

export function setupApiInterceptors(store) {
  api.interceptors.request.use((config) => {
    const token = store.getState().auth.accessToken;
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  });
  api.interceptors.response.use((res) => res, async (error) => {
    const original = error.config;
    const url = original?.url || '';
    const isAuthAction = url.includes('/auth/login') || url.includes('/auth/register') || url.includes('/auth/refresh');
    if (error.response?.status === 401 && original && !original._retry && !isAuthAction) {
      original._retry = true;
      try {
        const action = await store.dispatch(refreshSession({ silent: true })).unwrap();
        original.headers.Authorization = `Bearer ${action.accessToken}`;
        return api(original);
      } catch {
        store.dispatch(signedOut());
      }
    }
    return Promise.reject(error);
  });
}