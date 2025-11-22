import instance from './axios';

// Global request interceptor to add auth token from localStorage
instance.interceptors.request.use(
  (config) => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const token = window.localStorage.getItem('authToken');
        if (token) {
          if (!config.headers) {
            config.headers = {};
          }
          config.headers.Authorization = 'Token ' + token;
        }
      }
    } catch (error) {
      // Silent failure: do not break the request pipeline if localStorage is not available
      // This is mainly relevant for non-browser environments.
      console.error('Ошибка чтения токена авторизации из localStorage', error);
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default instance;
