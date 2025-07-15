import axios from 'axios';

// Create API instances for different services
const createAPI = (baseURL: string) => {
  const api = axios.create({
    baseURL,
    headers: {
      'Content-Type': 'application/json',
    },
    timeout: 40000,
  });

  // Request interceptor
  api.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('auth-token');
      if (token) {
        console.log('Token:', token);
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Response interceptor
  api.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        localStorage.removeItem('auth-token');
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }
  );

  return api;
};

// Create instances for different services
export const mainAPI = createAPI(process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000');
export const api = createAPI(process.env.NODE_API ?? 'http://localhost:5001/api');
export const medicineAPI = createAPI(process.env.NEXT_PUBLIC_MEDICINE_API_URL ?? 'http://localhost:3001/api');
export const mainChat = createAPI('http://localhost:5000');
// Default export for backward compatibility
export default mainAPI;