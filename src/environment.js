// 🌐 Environment-based Configuration System
// Development, Staging, ও Production এর জন্য আলাদা URL

import config from './config.js';

// ========================================
// 🔧 ENVIRONMENT DETECTION
// ========================================
const getCurrentEnv = () => {
  // Check localStorage first (for dynamic switching)
  const localEnv = localStorage.getItem('NODE_ENV');
  if (localEnv) {
    return localEnv;
  }

  // Fallback to process.env or default
  return process.env.NODE_ENV || 'development'; // Changed to development by default
};

const currentEnv = getCurrentEnv();

// Get the correct config for current environment
const getConfigForEnv = (env) => {
  return config[env] || config.development; // Default to development
};

// Create the environment configuration object with helper functions
const environmentConfig = {
  ...getConfigForEnv(currentEnv), // Use the correct config for current environment
  ENVIRONMENT: currentEnv,

  // Helper functions
  isDevelopment: () => currentEnv === 'development',
  isProduction: () => currentEnv === 'production',
  isStaging: () => currentEnv === 'staging',
  
  // Dynamic environment switching
  setEnvironment: (env) => {
    localStorage.setItem('NODE_ENV', env);
    window.location.reload(); // Reload to apply new config
  }
};

export default environmentConfig; 
