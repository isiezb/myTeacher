// Environment variables for frontend
const ENV = {
  // API and database configuration
  API_URL: window.RENDER_API_URL || "", // Fallback to same origin if not provided
  SUPABASE_URL: window.RENDER_SUPABASE_URL || "",
  SUPABASE_KEY: window.RENDER_SUPABASE_KEY || "",
  OPENROUTER_URL: window.RENDER_OPENROUTER_URL || "",
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
  // Validate required configuration
  const requiredVars = ['SUPABASE_URL', 'SUPABASE_KEY', 'OPENROUTER_URL', 'OPENROUTER_KEY'];
  const missingVars = requiredVars.filter(key => !ENV[key]);
  
  if (missingVars.length > 0) {
    console.warn('Missing required environment variables:', missingVars);
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