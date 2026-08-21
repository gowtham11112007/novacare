const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function seed() {
  console.log("Seeding Supabase Database...");
  
  await supabase.from('admin_keys').insert({ passkey_hash: 'admin123' });
  console.log("Admin key seeded: 'admin123'");
  
  const doctorKeys = ['doc1', 'doc2', 'doc3'];
  for (let k of doctorKeys) {
    await supabase.from('doctor_keys').insert({ passkey_hash: k });
  }
  console.log("Doctor keys seeded: 'doc1', 'doc2', 'doc3'");
  
  console.log("Seed script completed. You can now use these passkeys to register via the frontend.");
}

seed();
