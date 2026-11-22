-- Run once in the Supabase SQL Editor (after schema.sql).
-- Registration passkeys: sign up as "Administrator" with the admin key,
-- and as "Doctor" with any unused doctor key. CHANGE THESE before going to production.

INSERT INTO public.admin_keys (passkey_hash)
SELECT 'admin123' WHERE NOT EXISTS (SELECT 1 FROM public.admin_keys WHERE passkey_hash = 'admin123');

INSERT INTO public.doctor_keys (passkey_hash)
SELECT k FROM (VALUES ('doc1'), ('doc2'), ('doc3')) AS v(k)
WHERE NOT EXISTS (SELECT 1 FROM public.doctor_keys WHERE passkey_hash = v.k);
