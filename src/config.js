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
  
  // Local Development (for testing when Railway is down)
  local: {
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
    FRONTEND_URL: 'https://admin-aa3r.onrender.com/'
  },
  
  // Staging Environment
  staging: {
    API_BASE_URL: 'https://staging-your-domain.com',
    SOCKET_URL: 'https://staging-your-domain.com',
    MEDIA_BASE_URL: 'https://staging-your-domain.com/media',
    FRONTEND_URL: 'https://staging-your-domain.com'
  },
  
  // Render Environment (for Render deployment)
  render: {
    API_BASE_URL: 'https://apiserverjoin.onrender.com',
    SOCKET_URL: 'https://apiserverjoin.onrender.com',
    MEDIA_BASE_URL: 'https://apiserverjoin.onrender.com/media',
    FRONTEND_URL: 'https://admin-aa3r.onrender.com/'
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
  const env = process.env.NODE_ENV || 'production'; // Changed to production by default
  return config[env] || config.production; // Changed to production as fallback
};

// ========================================
// 📊 CURRENT CONFIG
// ========================================

// Utility functions for file handling
export const getFileExtension = (url) => {
  if (!url) return '';
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    const extension = pathname.split('.').pop().toLowerCase();
    return extension;
  } catch (e) {
    // If URL parsing fails, try to extract extension from the string
    const match = url.match(/\.([a-zA-Z0-9]+)(?:[?#]|$)/);
    return match ? match[1].toLowerCase() : '';
  }
};

export const isGif = (url) => {
  const extension = getFileExtension(url);
  return extension === 'gif' || url.toLowerCase().includes('gif');
};

export default getCurrentEnvironment(); 


