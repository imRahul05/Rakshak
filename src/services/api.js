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
    const token = JSON.parse(localStorage.getItem(config.auth.tokenStorageKey));
    if (token) {
      reqConfig.headers.Authorization = `Bearer ${token}`;
    }
    return reqConfig;
  },
  (error) => Promise.reject(error)
);
