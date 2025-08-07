// 🌍 Environment-based Configuration System
// Development, Staging, এবং Production এর জন্য আলাদা URL

// ========================================
// 🔧 ENVIRONMENT DETECTION
// ========================================
const environments = {
  development: {
    API_BASE_URL: 'http://localhost:5001',
    SOCKET_URL: 'http://localhost:5001',
    MEDIA_BASE_URL: 'http://localhost:5001/media',
    FRONTEND_URL: 'http://localhost:3000'
  },
  production: {
    API_BASE_URL: 'https://apiserverjoin-production.up.railway.app',
    SOCKET_URL: 'https://apiserverjoin-production.up.railway.app',
    MEDIA_BASE_URL: 'https://apiserverjoin-production.up.railway.app/media',
    FRONTEND_URL: 'https://your-render-app.onrender.com'
  }
};

const currentEnv = process.env.NODE_ENV || 'development';

// Create the environment configuration object with helper functions
const environmentConfig = {
  ...environments[currentEnv],
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
