// Environment variables for frontend
const ENV = {
  API_URL: "https://easystory.onrender.com",
  SUPABASE_URL: "https://YOUR_SUPABASE_URL.supabase.co",
  SUPABASE_ANON_KEY: "YOUR_SUPABASE_KEY",
  DEBUG: true
};

// Make environment variables available globally
(function loadEnv() {
  Object.keys(ENV).forEach(key => {
    window[`ENV_${key}`] = ENV[key];
  });
  console.log("Environment variables loaded:", ENV);
})(); 