import { createSlice } from '@reduxjs/toolkit';
import config from '../../config';

const loadInitialState = () => {
  const token = localStorage.getItem(config.auth.tokenStorageKey);
  const user = localStorage.getItem(config.auth.userStorageKey);
  return {
    user: user ? JSON.parse(user) : null,
    token: token ? JSON.parse(token) : null,
    isLoading: false,
    error: null,
  };
};

const initialState = loadInitialState();

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      const { user, token } = action.payload;
      state.user = user;
      state.token = token;
      localStorage.setItem(config.auth.tokenStorageKey, JSON.stringify(token));
      localStorage.setItem(config.auth.userStorageKey, JSON.stringify(user));
    },
    setUser: (state, action) => {
      state.user = action.payload;
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.error = null;
      localStorage.removeItem(config.auth.tokenStorageKey);
      localStorage.removeItem(config.auth.userStorageKey);
    },
  },
});

export const { setCredentials, setUser, setLoading, setError, logout } = authSlice.actions;

export default authSlice.reducer;

// Selectors
export const selectCurrentUser = (state) => state.auth.user;
export const selectCurrentToken = (state) => state.auth.token;
export const selectAuthLoading = (state) => state.auth.isLoading;
export const selectAuthError = (state) => state.auth.error;
