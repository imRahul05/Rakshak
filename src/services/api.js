import axios from 'axios';
import config from '../config';

export const axiosPublic = axios.create({
  baseURL: config.api.baseURL,
  headers: { 'Content-Type': 'application/json' },
});

export const axiosPrivate = axios.create({
  baseURL: config.api.baseURL,
  headers: { 'Content-Type': 'application/json' },
});

axiosPrivate.interceptors.request.use(
  (reqConfig) => {
    const token = localStorage.getItem(config.auth.tokenStorageKey);
    if (token) {
      reqConfig.headers.Authorization = `Bearer ${token}`;
    }
    return reqConfig;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor for handling auth errors
axiosPrivate.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem(config.auth.tokenStorageKey);
      localStorage.removeItem(config.auth.userStorageKey);
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
