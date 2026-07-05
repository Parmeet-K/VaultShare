import { createSlice } from '@reduxjs/toolkit';
export default createSlice({ name: 'profile', initialState: { sessions: [], loginHistory: [] }, reducers: { sessionsLoaded: (s, a) => { s.sessions = a.payload; } } }).reducer;
