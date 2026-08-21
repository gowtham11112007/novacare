-- schema.sql
-- users, doctors, patients, advice_log, appointments, admin_keys, doctor_keys

-- Create custom types for roles
CREATE TYPE user_role AS ENUM ('patient', 'doctor', 'admin');

-- 1. users
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  role user_role NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. doctors
CREATE TABLE IF NOT EXISTS public.doctors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  passkey_hash TEXT NOT NULL,
  current_load INT DEFAULT 0,
  specialization TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. patients
CREATE TABLE IF NOT EXISTS public.patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  assigned_doctor_id UUID REFERENCES public.doctors(id) ON DELETE SET NULL,
  trimester INT CHECK (trimester >= 1 AND trimester <= 3),
  risk_score INT DEFAULT 0,
  due_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. advice_log
CREATE TABLE IF NOT EXISTS public.advice_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE,
  doctor_id UUID REFERENCES public.doctors(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  category TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. appointments
CREATE TABLE IF NOT EXISTS public.appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE,
  doctor_id UUID REFERENCES public.doctors(id) ON DELETE CASCADE,
  slot_time TIMESTAMPTZ NOT NULL,
  status TEXT DEFAULT 'scheduled',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. admin_keys
CREATE TABLE IF NOT EXISTS public.admin_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  passkey_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. doctor_keys
CREATE TABLE IF NOT EXISTS public.doctor_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  passkey_hash TEXT NOT NULL,
  is_used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. risk_history (Optional, mentioned in prompt for line chart)
CREATE TABLE IF NOT EXISTS public.risk_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE,
  risk_score INT NOT NULL,
  recorded_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS setup
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.advice_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctor_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.risk_history ENABLE ROW LEVEL SECURITY;

-- Note: The service_role key bypasses RLS entirely, so the backend can do whatever it needs.
-- The frontend connects with the anon key and auth tokens.

-- RLS policies for Patients
CREATE POLICY "Patients can view their own user profile" ON public.users FOR SELECT USING (auth.uid() = id);

-- Patient can view their patient record
CREATE POLICY "Patients can view their own patient record" ON public.patients FOR SELECT USING (
  user_id = auth.uid()
);

-- Patient can view their doctor's public info (using subquery)
CREATE POLICY "Patients can view their doctor" ON public.doctors FOR SELECT USING (
  id IN (SELECT assigned_doctor_id FROM public.patients WHERE user_id = auth.uid())
);

-- Patient can view their own advice
CREATE POLICY "Patients can view their own advice" ON public.advice_log FOR SELECT USING (
  patient_id IN (SELECT id FROM public.patients WHERE user_id = auth.uid())
);

-- Patient can view their own appointments
CREATE POLICY "Patients can view their own appointments" ON public.appointments FOR SELECT USING (
  patient_id IN (SELECT id FROM public.patients WHERE user_id = auth.uid())
);

-- RLS policies for Doctors
CREATE POLICY "Doctors can view their own user profile" ON public.users FOR SELECT USING (auth.uid() = id);

-- Doctors can view their own doctor record
CREATE POLICY "Doctors can view their own doctor record" ON public.doctors FOR SELECT USING (
  user_id = auth.uid()
);

-- Doctors can view their assigned patients
CREATE POLICY "Doctors can view assigned patients" ON public.patients FOR SELECT USING (
  assigned_doctor_id IN (SELECT id FROM public.doctors WHERE user_id = auth.uid())
);

-- Doctors can view advice for their assigned patients
CREATE POLICY "Doctors can view advice for assigned patients" ON public.advice_log FOR SELECT USING (
  doctor_id IN (SELECT id FROM public.doctors WHERE user_id = auth.uid())
);

-- Doctors can view their appointments
CREATE POLICY "Doctors can view their appointments" ON public.appointments FOR SELECT USING (
  doctor_id IN (SELECT id FROM public.doctors WHERE user_id = auth.uid())
);

-- ==============================================================================
-- 9. PREGNANCY TRACKING & WELLNESS EXTENSIONS
-- ==============================================================================

-- 9.1 Kick Logs (Fetal Movement Sessions)
CREATE TABLE IF NOT EXISTS public.kick_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE,
  kick_count INT NOT NULL DEFAULT 0,
  duration_minutes INT DEFAULT 0,
  target_reached BOOLEAN DEFAULT FALSE,
  recorded_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9.2 Mood & Maternal Mental Health Logs
CREATE TABLE IF NOT EXISTS public.mood_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE,
  mood TEXT NOT NULL,
  mood_label TEXT,
  note TEXT,
  recorded_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9.3 Hydration & Nutrition Tracker Logs
CREATE TABLE IF NOT EXISTS public.water_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE,
  glasses_count INT DEFAULT 0,
  iron_taken BOOLEAN DEFAULT FALSE,
  folic_acid_taken BOOLEAN DEFAULT FALSE,
  log_date DATE DEFAULT CURRENT_DATE,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_patient_water_date UNIQUE (patient_id, log_date)
);

-- 9.4 Medication & Vitamin Reminders
CREATE TABLE IF NOT EXISTS public.medication_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE,
  medication_name TEXT NOT NULL,
  scheduled_time TEXT,
  taken BOOLEAN DEFAULT FALSE,
  log_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9.5 Weight & Vitals History
CREATE TABLE IF NOT EXISTS public.vitals_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE,
  weight_kg DECIMAL(5,2),
  bp_systolic INT,
  bp_diastolic INT,
  recorded_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9.6 Birth Plan / Preferences Note
CREATE TABLE IF NOT EXISTS public.birth_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID UNIQUE REFERENCES public.patients(id) ON DELETE CASCADE,
  pain_management TEXT,
  delivery_preference TEXT,
  support_people TEXT,
  atmosphere_notes TEXT,
  special_notes TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9.7 Emergency Contacts
CREATE TABLE IF NOT EXISTS public.emergency_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID UNIQUE REFERENCES public.patients(id) ON DELETE CASCADE,
  contact_name TEXT NOT NULL,
  contact_phone TEXT NOT NULL,
  relationship TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on new tables
ALTER TABLE public.kick_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mood_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.water_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medication_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vitals_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.birth_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emergency_contacts ENABLE ROW LEVEL SECURITY;

-- Patient Policies for new tables
CREATE POLICY "Patients manage their kick logs" ON public.kick_logs FOR ALL USING (
  patient_id IN (SELECT id FROM public.patients WHERE user_id = auth.uid())
);
CREATE POLICY "Patients manage their mood logs" ON public.mood_logs FOR ALL USING (
  patient_id IN (SELECT id FROM public.patients WHERE user_id = auth.uid())
);
CREATE POLICY "Patients manage their water logs" ON public.water_logs FOR ALL USING (
  patient_id IN (SELECT id FROM public.patients WHERE user_id = auth.uid())
);
CREATE POLICY "Patients manage their medication logs" ON public.medication_logs FOR ALL USING (
  patient_id IN (SELECT id FROM public.patients WHERE user_id = auth.uid())
);
CREATE POLICY "Patients manage their vitals logs" ON public.vitals_logs FOR ALL USING (
  patient_id IN (SELECT id FROM public.patients WHERE user_id = auth.uid())
);
CREATE POLICY "Patients manage their birth plans" ON public.birth_plans FOR ALL USING (
  patient_id IN (SELECT id FROM public.patients WHERE user_id = auth.uid())
);
CREATE POLICY "Patients manage their emergency contacts" ON public.emergency_contacts FOR ALL USING (
  patient_id IN (SELECT id FROM public.patients WHERE user_id = auth.uid())
);

-- Doctor Read Policies for assigned patients
CREATE POLICY "Doctors view kick logs" ON public.kick_logs FOR SELECT USING (
  patient_id IN (SELECT id FROM public.patients WHERE assigned_doctor_id IN (SELECT id FROM public.doctors WHERE user_id = auth.uid()))
);
CREATE POLICY "Doctors view mood logs" ON public.mood_logs FOR SELECT USING (
  patient_id IN (SELECT id FROM public.patients WHERE assigned_doctor_id IN (SELECT id FROM public.doctors WHERE user_id = auth.uid()))
);
CREATE POLICY "Doctors view vitals logs" ON public.vitals_logs FOR SELECT USING (
  patient_id IN (SELECT id FROM public.patients WHERE assigned_doctor_id IN (SELECT id FROM public.doctors WHERE user_id = auth.uid()))
);
CREATE POLICY "Doctors view birth plans" ON public.birth_plans FOR SELECT USING (
  patient_id IN (SELECT id FROM public.patients WHERE assigned_doctor_id IN (SELECT id FROM public.doctors WHERE user_id = auth.uid()))
);

-- Realtime publication setup
BEGIN;
  DROP PUBLICATION IF EXISTS supabase_realtime;
  CREATE PUBLICATION supabase_realtime;
COMMIT;
ALTER PUBLICATION supabase_realtime ADD TABLE public.patients;
ALTER PUBLICATION supabase_realtime ADD TABLE public.risk_history;
ALTER PUBLICATION supabase_realtime ADD TABLE public.appointments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.advice_log;
ALTER PUBLICATION supabase_realtime ADD TABLE public.mood_logs;
ALTER PUBLICATION supabase_realtime ADD TABLE public.kick_logs;

