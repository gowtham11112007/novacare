const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

// Passkeys come from backend/.env (never committed):
//   ADMIN_PASSKEY=your-secret-admin-key
//   DOCTOR_PASSKEYS=key-one,key-two,key-three
const adminKey = (process.env.ADMIN_PASSKEY || '').trim();
const doctorKeys = (process.env.DOCTOR_PASSKEYS || '').split(',').map((k) => k.trim()).filter(Boolean);

async function seed() {
  if (!adminKey || doctorKeys.length === 0) {
    console.error('Set ADMIN_PASSKEY and DOCTOR_PASSKEYS (comma-separated) in backend/.env before seeding.');
    process.exit(1);
  }

  console.log("Seeding Supabase Database...");

  await supabase.from('admin_keys').insert({ passkey_hash: adminKey });
  console.log("Admin key seeded.");

  for (const k of doctorKeys) {
    await supabase.from('doctor_keys').insert({ passkey_hash: k });
  }
  console.log(`${doctorKeys.length} doctor key(s) seeded.`);

  console.log("Seed script completed. Use your passkeys to register via the frontend.");
}

seed();
