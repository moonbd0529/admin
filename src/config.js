// 🚀 Dynamic URL Configuration System
// এক জায়গায় পরিবর্তন করলেই সব জায়গায় পরিবর্তন হবে

import environmentConfig from './environment.js';

// ========================================
// 🌐 BASE URL CONFIGURATION
// ========================================
// এখানে শুধু এই URL পরিবর্তন করুন
const BASE_URL = environmentConfig.API_BASE_URL;

// ========================================
// 🔧 ADVANCED CONFIGURATION
// ========================================
const URL_CONFIG = {
  // Base URLs from environment
  API_BASE_URL: environmentConfig.API_BASE_URL,
  SOCKET_URL: environmentConfig.SOCKET_URL,
  MEDIA_BASE_URL: environmentConfig.MEDIA_BASE_URL,
  FRONTEND_URL: environmentConfig.FRONTEND_URL,
  
  // Port configuration (if needed)
  API_PORT: '5001',
  FRONTEND_PORT: '3000',
  
  // Protocol (http/https)
  PROTOCOL: BASE_URL.startsWith('https') ? 'https' : 'http',
  
  // Domain extraction
  getDomain: () => {
    try {
      const url = new URL(BASE_URL);
      return url.hostname;
    } catch (error) {
      console.error('Error getting domain:', error);
      return 'localhost';
    }
  },
  
  // Port extraction
  getPort: () => {
    try {
      const url = new URL(BASE_URL);
      return url.port || (url.protocol === 'https:' ? '443' : '80');
    } catch (error) {
      console.error('Error getting port:', error);
      return '5001';
    }
  }
};

// ========================================
// 📱 MAIN CONFIGURATION OBJECT
// ========================================
const config = {
  // ========================================
  // 🌐 URL CONFIGURATION
  // ========================================
  API_BASE_URL: URL_CONFIG.API_BASE_URL,
  SOCKET_URL: URL_CONFIG.SOCKET_URL,
  MEDIA_BASE_URL: URL_CONFIG.MEDIA_BASE_URL,
  FRONTEND_URL: URL_CONFIG.FRONTEND_URL,
  
  // ========================================
  // 📁 FILE UPLOAD SETTINGS
  // ========================================
  MAX_FILE_SIZE: 50 * 1024 * 1024, // 50MB
  MAX_PHOTO_SIZE: 20 * 1024 * 1024, // 20MB
  
  // ========================================
  // 📄 SUPPORTED FILE TYPES
  // ========================================
  SUPPORTED_IMAGE_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
  SUPPORTED_VIDEO_TYPES: ['video/mp4', 'video/avi', 'video/mov', 'video/wmv', 'video/flv', 'video/webm'],
  SUPPORTED_AUDIO_TYPES: ['audio/mp3', 'audio/wav', 'audio/ogg', 'audio/m4a', 'audio/aac'],
  
  // ========================================
  // 📊 PAGINATION SETTINGS
  // ========================================
  DEFAULT_PAGE_SIZE: 10,
  
  // ========================================
  // 🖥️ UI SETTINGS
  // ========================================
  CHAT_WINDOW_WIDTH: 400,
  CHAT_WINDOW_HEIGHT: 600,
  
  // ========================================
  // 🎤 RECORDING SETTINGS
  // ========================================
  MAX_RECORDING_DURATION: 60, // seconds
  
  // ========================================
  // 🔗 URL HELPER FUNCTIONS
  // ========================================
  
  // Get media URL with proper formatting
  getMediaUrl: (url) => {
    if (!url) return '';
    
    // If already a full URL, return as is
    if (url.startsWith('http')) {
      return url;
    }
    
    // If it's a relative path, prepend the base URL
    if (url.startsWith('/')) {
      return `${URL_CONFIG.API_BASE_URL}${url}`;
    }
    
    // If it's a media file, use media base URL
    if (url.includes('/media/') || url.includes('media/')) {
      return `${URL_CONFIG.MEDIA_BASE_URL}/${url.replace(/^.*?media\//, '')}`;
    }
    
    // Default fallback
    return `${URL_CONFIG.API_BASE_URL}/${url}`;
  },
  
  // Get API endpoint URL
  getApiUrl: (endpoint) => {
    if (!endpoint) return URL_CONFIG.API_BASE_URL;
    
    // Remove leading slash if present
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
    return `${URL_CONFIG.API_BASE_URL}/${cleanEndpoint}`;
  },
  
  // Get WebSocket URL
  getSocketUrl: () => {
    return URL_CONFIG.SOCKET_URL;
  },
  
  // Get full URL for any path
  getFullUrl: (path) => {
    if (!path) return URL_CONFIG.API_BASE_URL;
    
    // If already a full URL, return as is
    if (path.startsWith('http')) {
      return path;
    }
    
    // Remove leading slash if present
    const cleanPath = path.startsWith('/') ? path.slice(1) : path;
    return `${URL_CONFIG.API_BASE_URL}/${cleanPath}`;
  },
  
  // ========================================
  // 🖼️ MEDIA HELPER FUNCTIONS
  // ========================================
  
  // Check if URL is a GIF
  isGif: (url) => {
    if (!url) return false;
    const lowerUrl = url.toLowerCase();
    return (
      lowerUrl.includes('.gif') || 
      lowerUrl.includes('image/gif') ||
      lowerUrl.includes('gif') ||
      /\.gif(\?|$)/.test(lowerUrl) ||
      /\/.*\.gif/.test(lowerUrl)
    );
  },
  
  // Get file extension from URL
  getFileExtension: (url) => {
    if (!url) return '';
    const match = url.match(/\.([a-zA-Z0-9]+)(\?|$)/);
    return match ? match[1].toLowerCase() : '';
  },
  
  // Check if file is an image
  isImage: (url) => {
    const ext = config.getFileExtension(url);
    return ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext);
  },
  
  // Check if file is a video
  isVideo: (url) => {
    const ext = config.getFileExtension(url);
    return ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm'].includes(ext);
  },
  
  // Check if file is an audio
  isAudio: (url) => {
    const ext = config.getFileExtension(url);
    return ['mp3', 'wav', 'ogg', 'm4a', 'aac'].includes(ext);
  },
  
  // ========================================
  // 🔧 UTILITY FUNCTIONS
  // ========================================
  
  // Get current environment
  getEnvironment: () => {
    try {
      return environmentConfig.ENVIRONMENT;
    } catch (error) {
      console.error('Error getting environment:', error);
      return 'development';
    }
  },
  
  // Check if running in development
  isDevelopment: () => {
    try {
      return environmentConfig.isDevelopment();
    } catch (error) {
      console.error('Error checking development mode:', error);
      return process.env.NODE_ENV === 'development';
    }
  },
  
  // Check if running in staging
  isStaging: () => {
    try {
      return environmentConfig.isStaging();
    } catch (error) {
      console.error('Error checking staging mode:', error);
      return false;
    }
  },
  
  // Check if running in production
  isProduction: () => {
    try {
      return environmentConfig.isProduction();
    } catch (error) {
      console.error('Error checking production mode:', error);
      return process.env.NODE_ENV === 'production';
    }
  },
  
  // Get domain name
  getDomain: () => {
    return URL_CONFIG.getDomain();
  },
  
  // Get port number
  getPort: () => {
    return URL_CONFIG.getPort();
  },
  
  // Get protocol
  getProtocol: () => {
    return URL_CONFIG.PROTOCOL;
  },
  
  // Get environment config
  getEnvironmentConfig: () => {
    return environmentConfig;
  },
  
  // ========================================
  // 📊 DEBUG INFORMATION
  // ========================================
  
  // Log current configuration (for debugging)
  logConfig: () => {
    try {
      if (config.isDevelopment()) {
        console.log('🔧 Current Configuration:', {
          environment: config.getEnvironment(),
          baseUrl: URL_CONFIG.API_BASE_URL,
          domain: config.getDomain(),
          port: config.getPort(),
          protocol: config.getProtocol(),
          socketUrl: config.getSocketUrl(),
          mediaUrl: URL_CONFIG.MEDIA_BASE_URL,
          frontendUrl: URL_CONFIG.FRONTEND_URL
        });
      }
    } catch (error) {
      console.error('Error logging config:', error);
    }
  }
};

// ========================================
// 🚀 AUTO-INITIALIZATION
// ========================================
// Log configuration in development mode
try {
  if (config.isDevelopment()) {
    config.logConfig();
  }
} catch (error) {
  console.error('Error during config initialization:', error);
}

export default config; 
