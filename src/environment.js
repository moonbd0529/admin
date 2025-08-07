// 🌍 Environment-based Configuration System
// Development, Staging, এবং Production এর জন্য আলাদা URL

import config from './config.js';

// ========================================
// 🔧 ENVIRONMENT DETECTION
// ========================================
const currentEnv = process.env.NODE_ENV || 'development';

// Create the environment configuration object with helper functions
const environmentConfig = {
  ...config,
  ENVIRONMENT: currentEnv,
  
  // Environment detection functions
  isDevelopment: () => {
    try {
      return currentEnv === 'development';
    } catch (error) {
      console.error('Error in isDevelopment:', error);
      return true; // Default to development
    }
  },
  isStaging: () => {
    try {
      return currentEnv === 'staging';
    } catch (error) {
      console.error('Error in isStaging:', error);
      return false;
    }
  },
  isProduction: () => {
    try {
      return currentEnv === 'production';
    } catch (error) {
      console.error('Error in isProduction:', error);
      return false;
    }
  }
};

export default environmentConfig; 
