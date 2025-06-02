const config = {
  api: {
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
    socketURL: import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000',
  },
  cloudinary: {
    cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME,
    uploadPreset: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET,
  },
  maps: {
    apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  },
  auth: {
    jwtSecret: import.meta.env.VITE_JWT_SECRET,
    tokenStorageKey: 'rakshak_token',
    userStorageKey: 'rakshak_user',
  },
};

export default config;
