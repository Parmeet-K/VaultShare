import { createSlice } from '@reduxjs/toolkit';
const initialMode = localStorage.getItem('vaultshare-theme') || 'dark';
const initialLocale = localStorage.getItem('vaultshare-locale') || 'en';
const slice = createSlice({
  name: 'theme',
  initialState: { mode: initialMode, locale: initialLocale },
  reducers: {
    toggleTheme: (s) => { s.mode = s.mode === 'dark' ? 'light' : 'dark'; localStorage.setItem('vaultshare-theme', s.mode); },
    setLocale: (s, a) => { s.locale = a.payload; localStorage.setItem('vaultshare-locale', s.locale); }
  }
});
export const { toggleTheme, setLocale } = slice.actions;
export default slice.reducer;