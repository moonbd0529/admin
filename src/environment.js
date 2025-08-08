import config from './config.js';

const getCurrentEnv = () => {
  const hostname = window.location.hostname;

  // Production check
  if (
    hostname.includes('onrender.com') ||
    hostname.includes('railway.app') ||
    hostname === 'yourdomain.com'
  ) {
    return 'production';
  }

  // Staging check
  if (hostname.startsWith('staging.') || hostname.includes('staging-')) {
    return 'staging';
  }

  // Query param override
  const params = new URLSearchParams(window.location.search);
  if (params.has('env')) {
    return params.get('env');
  }

  // LocalStorage override
  const localEnv = localStorage.getItem('NODE_ENV');
  if (localEnv) {
    return localEnv;
  }

  // Default fallback
  return process.env.NODE_ENV || 'development';
};

const currentEnv = getCurrentEnv();

const getConfigForEnv = (env) => {
  if (!config[env]) {
    console.warn(`⚠️ No config for "${env}", using development.`);
  }
  return config[env] || config.development;
};

const environmentConfig = {
  ...getConfigForEnv(currentEnv),
  ENVIRONMENT: currentEnv,

  isDevelopment: () => currentEnv === 'development',
  isProduction: () => currentEnv === 'production',
  isStaging: () => currentEnv === 'staging',

  setEnvironment: (env) => {
    if (env === currentEnv) return;
    localStorage.setItem('NODE_ENV', env);
    window.location.reload();
  }
};

export default environmentConfig;
