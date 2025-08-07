// 🔧 Simple Configuration File
// এখানে API URL গুলো পরিবর্তন করুন

const config = {
  // ========================================
  // 🌐 API CONFIGURATION
  // ========================================
  
  // Development Environment
  development: {
    API_BASE_URL: 'http://localhost:5001',
    SOCKET_URL: 'http://localhost:5001',
    MEDIA_BASE_URL: 'http://localhost:5001/media',
    FRONTEND_URL: 'http://localhost:3000'
  },
  
  // Production Environment
  production: {
    API_BASE_URL: 'https://apiserverjoin-production.up.railway.app',
    SOCKET_URL: 'https://apiserverjoin-production.up.railway.app',
    MEDIA_BASE_URL: 'https://apiserverjoin-production.up.railway.app/media',
    FRONTEND_URL: 'https://admin-o7ei.onrender.com'
  },
  
  // Staging Environment
  staging: {
    API_BASE_URL: 'https://staging-your-domain.com',
    SOCKET_URL: 'https://staging-your-domain.com',
    MEDIA_BASE_URL: 'https://staging-your-domain.com/media',
    FRONTEND_URL: 'https://staging-your-domain.com'
  }
};

// ========================================
// 🔧 QUICK CHANGE FUNCTIONS
// ========================================

// Change to localhost for development
export const setLocalhost = () => {
  console.log('🔄 Switching to localhost configuration');
  return config.development;
};

// Change to production
export const setProduction = () => {
  console.log('🔄 Switching to production configuration');
  return config.production;
};

// Change to staging
export const setStaging = () => {
  console.log('🔄 Switching to staging configuration');
  return config.staging;
};

// Get current environment
export const getCurrentEnvironment = () => {
  const env = process.env.NODE_ENV || 'development';
  return config[env] || config.development;
};

// ========================================
// 📊 CURRENT CONFIG
// ========================================

export default getCurrentEnvironment(); 
