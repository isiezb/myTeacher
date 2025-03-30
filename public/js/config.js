// config.js
const CONFIG = {
  api: {
    baseUrl: window.ENV_API_URL || "https://easystory.onrender.com",
    timeout: 30000,
    retries: 2
  },
  ui: {
    theme: "light",
    animations: true,
    toastDuration: 5000
  },
  story: {
    defaultWordCount: 300,
    defaultLanguage: "English"
  },
  debug: window.ENV_DEBUG || false
};

// Initialize and make config available globally
(function initConfig() {
  window.appConfig = CONFIG;
  console.log("Config initialized:", CONFIG);
})(); 