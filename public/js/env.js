// Environment variables for frontend
const ENV = {
  // API and database configuration
  API_URL: window.RENDER_API_URL || window.location.origin, // Fallback to same origin
  SUPABASE_URL: window.RENDER_SUPABASE_URL || "",
  SUPABASE_KEY: window.RENDER_SUPABASE_KEY || "",
  OPENROUTER_URL: window.RENDER_OPENROUTER_URL || "https://openrouter.ai/api/v1",
  OPENROUTER_KEY: window.RENDER_OPENROUTER_KEY || "",
  
  // Feature flags and debug settings
  DEBUG: window.RENDER_DEBUG === "true" || false,
  ENABLE_STORAGE: window.RENDER_ENABLE_STORAGE !== "false", // Enabled by default
  
  // Error reporting configuration
  ERROR_REPORTING: {
    ENABLED: true,
    MAX_ERRORS: 10, // Maximum number of errors to track
    REPORTING_INTERVAL: 60000 // Report errors every minute
  }
};

// Make environment variables available globally and validate configuration
(function loadEnv() {
  // Required variables and their descriptions
  const requiredVars = {
    SUPABASE_URL: 'Supabase project URL',
    SUPABASE_KEY: 'Supabase anonymous key',
    OPENROUTER_URL: 'OpenRouter API URL',
    OPENROUTER_KEY: 'OpenRouter API key'
  };
  
  // Check for missing required variables
  const missingVars = Object.entries(requiredVars)
    .filter(([key]) => !ENV[key])
    .map(([key, desc]) => `${key} (${desc})`);
  
  if (missingVars.length > 0) {
    console.warn('Missing required environment variables:', missingVars);
    
    // Set mock mode if critical variables are missing
    if (missingVars.includes('SUPABASE_URL') || missingVars.includes('SUPABASE_KEY')) {
      ENV.MOCK_MODE = true;
      console.log('Entering mock mode due to missing credentials');
    }
  }

  // Make variables available globally with ENV_ prefix
  Object.keys(ENV).forEach(key => {
    window[`ENV_${key}`] = ENV[key];
  });

  // Log configuration status in debug mode
  if (ENV.DEBUG) {
    console.log('Environment configuration loaded:', {
      ...ENV,
      SUPABASE_KEY: ENV.SUPABASE_KEY ? '[HIDDEN]' : undefined,
      OPENROUTER_KEY: ENV.OPENROUTER_KEY ? '[HIDDEN]' : undefined
    });
  }
})(); 