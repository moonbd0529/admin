// 🔗 URL Management System
// সহজে URL পরিবর্তন করার জন্য

import environmentConfig from './environment.js';

// ========================================
// 🌐 URL CHANGE FUNCTIONS
// ========================================

const urlManager = {
  // ========================================
  // 🔧 QUICK URL CHANGES
  // ========================================
  
  // Development URL সেট করুন
  setDevelopmentUrl: (baseUrl) => {
    console.log('🔄 Setting Development URL:', baseUrl);
    // এখানে environment.js ফাইল আপডেট করতে হবে
    return {
      API_BASE_URL: baseUrl,
      SOCKET_URL: baseUrl,
      MEDIA_BASE_URL: `${baseUrl}/media`,
      FRONTEND_URL: baseUrl.replace(':5001', ':3000')
    };
  },
  
  // Production URL সেট করুন
  setProductionUrl: (domain) => {
    console.log('🔄 Setting Production URL:', domain);
    return {
      API_BASE_URL: `https://${domain}`,
      SOCKET_URL: `https://${domain}`,
      MEDIA_BASE_URL: `https://${domain}/media`,
      FRONTEND_URL: `https://${domain}`
    };
  },
  
  // Staging URL সেট করুন
  setStagingUrl: (domain) => {
    console.log('🔄 Setting Staging URL:', domain);
    return {
      API_BASE_URL: `https://staging.${domain}`,
      SOCKET_URL: `https://staging.${domain}`,
      MEDIA_BASE_URL: `https://staging.${domain}/media`,
      FRONTEND_URL: `https://staging.${domain}`
    };
  },
  
  // ========================================
  // 📊 URL VALIDATION
  // ========================================
  
  // URL ভ্যালিড কিনা চেক করুন
  isValidUrl: (url) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  },
  
  // Domain ভ্যালিড কিনা চেক করুন
  isValidDomain: (domain) => {
    const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/;
    return domainRegex.test(domain);
  },
  
  // ========================================
  // 🔄 URL TRANSFORMATION
  // ========================================
  
  // HTTP থেকে HTTPS এ পরিবর্তন
  toHttps: (url) => {
    return url.replace('http://', 'https://');
  },
  
  // HTTPS থেকে HTTP এ পরিবর্তন
  toHttp: (url) => {
    return url.replace('https://', 'http://');
  },
  
  // Port পরিবর্তন
  changePort: (url, newPort) => {
    const urlObj = new URL(url);
    urlObj.port = newPort;
    return urlObj.toString();
  },
  
  // ========================================
  // 📋 URL TEMPLATES
  // ========================================
  
  // Common URL templates
  templates: {
    localhost: {
      development: 'http://localhost:5001',
      frontend: 'http://localhost:3000'
    },
    production: {
      api: 'https://your-domain.com',
      frontend: 'https://your-domain.com'
    },
    staging: {
      api: 'https://staging.your-domain.com',
      frontend: 'https://staging.your-domain.com'
    }
  },
  
  // ========================================
  // 🎯 QUICK SETUP FUNCTIONS
  // ========================================
  
  // Local development setup
  setupLocal: () => {
    return {
      API_BASE_URL: 'http://localhost:5001',
      SOCKET_URL: 'http://localhost:5001',
      MEDIA_BASE_URL: 'http://localhost:5001/media',
      FRONTEND_URL: 'http://localhost:3000'
    };
  },
  
  // Production setup
  setupProduction: (domain) => {
    if (!urlManager.isValidDomain(domain)) {
      throw new Error('Invalid domain name');
    }
    
    return {
      API_BASE_URL: `https://${domain}`,
      SOCKET_URL: `https://${domain}`,
      MEDIA_BASE_URL: `https://${domain}/media`,
      FRONTEND_URL: `https://${domain}`
    };
  },
  
  // Staging setup
  setupStaging: (domain) => {
    if (!urlManager.isValidDomain(domain)) {
      throw new Error('Invalid domain name');
    }
    
    return {
      API_BASE_URL: `https://staging.${domain}`,
      SOCKET_URL: `https://staging.${domain}`,
      MEDIA_BASE_URL: `https://staging.${domain}/media`,
      FRONTEND_URL: `https://staging.${domain}`
    };
  },
  
  // ========================================
  // 📊 CURRENT STATUS
  // ========================================
  
  // বর্তমান URL গুলো দেখুন
  getCurrentUrls: () => {
    return {
      environment: environmentConfig.ENVIRONMENT,
      apiUrl: environmentConfig.API_BASE_URL,
      socketUrl: environmentConfig.SOCKET_URL,
      mediaUrl: environmentConfig.MEDIA_BASE_URL,
      frontendUrl: environmentConfig.FRONTEND_URL
    };
  },
  
  // URL পরিবর্তনের ইতিহাস
  history: [],
  
  // URL পরিবর্তন লগ করুন
  logUrlChange: (oldUrl, newUrl, reason = 'Manual change') => {
    urlManager.history.push({
      timestamp: new Date().toISOString(),
      oldUrl,
      newUrl,
      reason
    });
    
    console.log('📝 URL Change Logged:', {
      oldUrl,
      newUrl,
      reason,
      timestamp: new Date().toISOString()
    });
  },
  
  // পরিবর্তনের ইতিহাস দেখুন
  getHistory: () => {
    return urlManager.history;
  },
  
  // ========================================
  // 🔧 UTILITY FUNCTIONS
  // ========================================
  
  // URL থেকে domain extract করুন
  extractDomain: (url) => {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname;
    } catch {
      return null;
    }
  },
  
  // URL থেকে port extract করুন
  extractPort: (url) => {
    try {
      const urlObj = new URL(url);
      return urlObj.port || (urlObj.protocol === 'https:' ? '443' : '80');
    } catch {
      return null;
    }
  },
  
  // URL থেকে protocol extract করুন
  extractProtocol: (url) => {
    try {
      const urlObj = new URL(url);
      return urlObj.protocol.replace(':', '');
    } catch {
      return null;
    }
  }
};

export default urlManager; 