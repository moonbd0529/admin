// 🔗 Dynamic API Configuration
// API endpoints কে dynamic করে তোলার জন্য

import environmentConfig from './environment.js';

// ========================================
// 🌐 API ENDPOINTS CONFIGURATION
// ========================================

const apiConfig = {
  // Base URLs from environment
  get baseUrl() {
    return environmentConfig.API_BASE_URL;
  },
  
  get socketUrl() {
    return environmentConfig.SOCKET_URL;
  },
  
  get mediaUrl() {
    return environmentConfig.MEDIA_BASE_URL;
  },

  // ========================================
  // 📊 DASHBOARD ENDPOINTS
  // ========================================
  
  // Get dashboard users with pagination
  getDashboardUsers: (page = 1, pageSize = 10) => {
    return `${apiConfig.baseUrl}/dashboard-users?page=${page}&page_size=${pageSize}`;
  },
  
  // Get dashboard statistics
  getDashboardStats: () => {
    return `${apiConfig.baseUrl}/dashboard-stats`;
  },
  
  // ========================================
  // 💬 CHAT ENDPOINTS
  // ========================================
  
  // Get chat messages for a user
  getChatMessages: (userId) => {
    return `${apiConfig.baseUrl}/chat/${userId}/messages`;
  },
  
  // Send message to a user
  sendChatMessage: (userId) => {
    return `${apiConfig.baseUrl}/chat/${userId}`;
  },
  
  // ========================================
  // 📢 BROADCAST ENDPOINTS
  // ========================================
  
  // Send broadcast message to all users
  sendBroadcast: () => {
    return `${apiConfig.baseUrl}/send_all`;
  },
  
  // Send direct message to specific user
  sendDirectMessage: () => {
    return `${apiConfig.baseUrl}/send_one`;
  },
  
  // ========================================
  // 🔗 INVITE LINK ENDPOINTS
  // ========================================
  
  // Get channel invite link
  getChannelInviteLink: () => {
    return `${apiConfig.baseUrl}/get_channel_invite_link`;
  },
  
  // ========================================
  // 👤 USER MANAGEMENT ENDPOINTS
  // ========================================
  
  // Update user label
  updateUserLabel: (userId) => {
    return `${apiConfig.baseUrl}/user/${userId}/label`;
  },
  
  // ========================================
  // 🔧 UTILITY FUNCTIONS
  // ========================================
  
  // Get current configuration
  getCurrentConfig: () => {
    return {
      baseUrl: apiConfig.baseUrl,
      socketUrl: apiConfig.socketUrl,
      mediaUrl: apiConfig.mediaUrl,
      environment: environmentConfig.ENVIRONMENT
    };
  },
  
  // Check if API is accessible
  checkApiHealth: () => {
    return fetch(`${apiConfig.baseUrl}/dashboard-stats`, {
      method: 'GET',
      credentials: 'include'
    })
    .then(response => response.ok)
    .catch(error => {
      console.error('API Health Check Failed:', error);
      return false;
    });
  },
  
  // Get socket connection URL
  getSocketUrl: () => {
    return apiConfig.socketUrl;
  }
};

export default apiConfig; 