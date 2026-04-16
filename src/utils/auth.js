import CryptoJS from 'crypto-js';
import { Storage } from './storage';

const SECRET_KEY = 'shelter-search-secret-key-2025';

export const AuthService = {
  // Hash password using SHA256
  hashPassword(password) {
    return CryptoJS.SHA256(password + SECRET_KEY).toString();
  },

  // Verify password
  verifyPassword(password, hash) {
    return this.hashPassword(password) === hash;
  },

  // Sign up user
  async signup(userData) {
    try {
      // Check if user exists
      const existingUser = await Storage.getUserByEmail(userData.email);
      if (existingUser) {
        throw new Error('Email already registered');
      }

      // Hash password
      const hashedPassword = this.hashPassword(userData.password);

      // Create user object
      const user = {
        id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
        password: hashedPassword,
        createdAt: new Date().toISOString()
      };

      // Save to storage
      await Storage.addUser(user);

      // Set current user in localStorage
      const userWithoutPassword = { ...user };
      delete userWithoutPassword.password;
      localStorage.setItem('currentUser', JSON.stringify(userWithoutPassword));

      return { success: true, user: userWithoutPassword };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Login user
  async login(email, password) {
    try {
      const user = await Storage.getUserByEmail(email);

      if (!user) {
        throw new Error('User not found');
      }

      if (!this.verifyPassword(password, user.password)) {
        throw new Error('Invalid password');
      }

      // Set current user in localStorage
      const userWithoutPassword = { ...user };
      delete userWithoutPassword.password;
      localStorage.setItem('currentUser', JSON.stringify(userWithoutPassword));

      return { success: true, user: userWithoutPassword };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Logout user
  logout() {
    localStorage.removeItem('currentUser');
    return true;
  },

  // Get current user
  getCurrentUser() {
    const userStr = localStorage.getItem('currentUser');
    return userStr ? JSON.parse(userStr) : null;
  },

  // Check if user is authenticated
  isAuthenticated() {
    return !!this.getCurrentUser();
  },

  // Update user profile
  async updateProfile(userId, profileData) {
    try {
      const user = await Storage.getUserByEmail(profileData.email);
      if (user && user.id !== userId) {
        throw new Error('Email already in use');
      }

      // Update user in storage
      const currentUser = this.getCurrentUser();
      const updatedUser = {
        ...currentUser,
        ...profileData
      };

      await Storage.updateUser(updatedUser);

      // Update localStorage
      delete updatedUser.password;
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));

      return { success: true, user: updatedUser };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
};

export default AuthService;
