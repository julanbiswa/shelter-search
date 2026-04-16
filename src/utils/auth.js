import api from '../utils/api';

const Auth = {
  // Register user
  async register(user) {
    try {
      const response = await api.post('/auth/register', user);
      const userData = response.data;
      // Store user in localStorage
      localStorage.setItem('user', JSON.stringify(userData));
      return { success: true, user: userData };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Signup user (alias for register)
  async signup(user) {
    return this.register(user);
  },

  // Login user
  async login(email, password) {
    try {
      const response = await api.post('/auth/login', { email, password });
      const userData = response.data;
      // Store user in localStorage
      localStorage.setItem('user', JSON.stringify(userData));
      return { success: true, user: userData };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Logout user
  async logout() {
    try {
      await api.post('/auth/logout');
      // Remove user from localStorage
      localStorage.removeItem('user');
      return true;
    } catch (error) {
      // Remove user from localStorage even if API call fails
      localStorage.removeItem('user');
      return false;
    }
  },

  // Get current user
  async getCurrentUser() {
    try {
      // First check localStorage
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        return JSON.parse(storedUser);
      }
      
      // If no stored user, try API
      const response = await api.get('/auth/current-user');
      return response.data;
    } catch (error) {
      // Return null if error or no user
      return null;
    }
  },

  // Check if user is authenticated
  async isAuthenticated() {
    const user = await this.getCurrentUser();
    return !!user;
  },

  // Update user profile
  async updateProfile(userId, profileData) {
    try {
      const response = await api.put(`/auth/update-profile/${userId}`, profileData);
      const userData = response.data;
      // Update user in localStorage
      localStorage.setItem('user', JSON.stringify(userData));
      return { success: true, user: userData };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
};

export default Auth;
export const AuthService = Auth;
