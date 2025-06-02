import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import incidentsReducer from '../features/incidents/incidentsSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    incidents: incidentsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});
