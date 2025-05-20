import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL,
  withCredentials: true,
  headers: { 
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to add the auth token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    console.log(token)
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle token expiration
// api.interceptors.response.use(
//   (response) => {
//     return response;
//   },
//   async (error) => {
//     const originalRequest = error.config;
    
//     // If the error is 401 and we haven't attempted to refresh the token yet
//     if (error.response.status === 401 && !originalRequest._retry) {
//       originalRequest._retry = true;
      
//       // Clear the auth state if token is invalid
//       localStorage.removeItem('token');
//       localStorage.removeItem('user');
      
//       // Redirect to login page
//       window.location.href = 'auth/login';
      
//       return Promise.reject(error);
//     }
    
//     return Promise.reject(error);
//   }
// );

export default api;