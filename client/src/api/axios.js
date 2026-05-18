import axios from 'axios';
import NProgress from 'nprogress';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
  withCredentials: true,
  timeout: 10000,
});

api.interceptors.request.use(
  (config) => {
    if (!config.silent) {
      NProgress.start();
    }
    return config;
  },
  (error) => {
    NProgress.done();
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (res) => {
    if (!res.config.silent) {
      NProgress.done();
    }
    return res;
  },
  (err) => {
    NProgress.done();
    if (err.response?.status === 401) {
      window.location.href = '/';
    }
    return Promise.reject(err);
  }
);

export default api;
