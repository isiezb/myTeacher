// Environment variables for frontend
const ENV = {
  API_URL: "", // API is now served from the same origin
  
  // ===== IMPORTANT: SUPABASE SETUP INSTRUCTIONS =====
  // 1. Create a free Supabase account at https://supabase.com
  // 2. Create a new project
  // 3. Get your URL and anon key from Settings > API in your Supabase dashboard
  // 4. Replace the placeholder values below with your actual credentials
  // 5. Create a table called 'stories' with these columns:
  //    - id: uuid (primary key, default: uuid_generate_v4())
  //    - created_at: timestamp with timezone (default: now())
  //    - title: text
  //    - content: text
  //    - summary: text
  //    - academic_grade: text
  //    - subject: text
  //    - word_count: integer
  //    - vocab_list: jsonb
  //    - quiz_data: jsonb
  // ===================================================
  SUPABASE_URL: "https://YOUR_SUPABASE_URL.supabase.co",
  SUPABASE_ANON_KEY: "YOUR_SUPABASE_KEY",
  
  DEBUG: true,
  ENABLE_STORAGE: true // Set to false to disable story saving
};

// Make environment variables available globally
(function loadEnv() {
  Object.keys(ENV).forEach(key => {
    window[`ENV_${key}`] = ENV[key];
  });
  console.log("Environment variables loaded:", ENV);
})(); 