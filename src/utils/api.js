import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api', // Replace with your backend API base URL
  timeout: 10000, // Set a timeout for requests
});

// Add a request interceptor
api.interceptors.request.use(
  (config) => {
    // Add authorization token if available
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle global errors
    if (error.response && error.response.status === 401) {
      // Handle unauthorized errors
      console.error('Unauthorized access - clearing user session');
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    }
    return Promise.reject(error);
  }
);

export default api;