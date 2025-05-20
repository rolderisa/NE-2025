const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

export  const API_ENDPOINTS = {
  auth: {
    login: `${API_BASE_URL}/auth/login`,
    register: `${API_BASE_URL}/user/create`,
    verifyAccountInitiate: `${API_BASE_URL}/auth/initiate-email-verification`,
    verifyAccountConfirm: (code) => `${API_BASE_URL}/auth/verify-email`,
    resetPasswordInitiate: `${API_BASE_URL}/auth/initiate-reset-password`,
    resetPasswordConfirm: `${API_BASE_URL}/auth/reset-password`,
  },
};
export default API_ENDPOINTS;