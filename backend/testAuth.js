require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function testSignup() {
  console.log('Testing admin.createUser...');
  const { data, error } = await supabase.auth.admin.createUser({
    email: 'test_db_error@example.com',
    password: 'password123',
    email_confirm: true
  });
  
  if (error) {
    console.error('ERROR RETURNED:', error);
  } else {
    console.log('SUCCESS:', data.user.id);
    await supabase.auth.admin.deleteUser(data.user.id);
  }
}

testSignup();
