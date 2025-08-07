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
    API_BASE_URL: 'https://your-railway-app.railway.app',
    SOCKET_URL: 'https://your-railway-app.railway.app',
    MEDIA_BASE_URL: 'https://your-railway-app.railway.app/media',
    FRONTEND_URL: 'https://your-render-app.onrender.com'
  }
};

const currentEnv = process.env.NODE_ENV || 'development';
export default environments[currentEnv]; 