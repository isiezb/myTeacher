/**
 * Supabase Client
 * Minimal mock implementation for development
 */

console.log('Loading Supabase client...');

// Check if Supabase is already defined
if (window.supabase) {
  console.log('Supabase client already available in window');
} else {
  console.log('Supabase client not found, skipping initialization');
}

// Export a mock initialization function
window.initSupabase = async function() {
  console.log('Mock Supabase initialization');
  return Promise.resolve({
    user: null,
    session: null
  });
}; 