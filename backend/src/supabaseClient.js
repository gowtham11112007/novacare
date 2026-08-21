const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error("Missing Supabase credentials in backend .env");
  process.exit(1);
}

// Use Service Role Key in the backend to bypass RLS and perform admin operations
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

module.exports = supabase;
