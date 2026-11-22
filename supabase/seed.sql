-- Run once in the Supabase SQL Editor (after schema.sql).
-- Registration passkeys: sign up as "Administrator" with the admin key,
-- and as "Doctor" with any unused doctor key.
-- Replace every <...> placeholder below with your own secret passkeys before running.
-- Never commit real passkeys to the repository.

INSERT INTO public.admin_keys (passkey_hash)
SELECT '<ADMIN_PASSKEY>' WHERE NOT EXISTS (SELECT 1 FROM public.admin_keys WHERE passkey_hash = '<ADMIN_PASSKEY>');

INSERT INTO public.doctor_keys (passkey_hash)
SELECT k FROM (VALUES ('<DOCTOR_PASSKEY_1>'), ('<DOCTOR_PASSKEY_2>'), ('<DOCTOR_PASSKEY_3>')) AS v(k)
WHERE NOT EXISTS (SELECT 1 FROM public.doctor_keys WHERE passkey_hash = v.k);
