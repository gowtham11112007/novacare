-- Run this once in the Supabase SQL Editor if schema.sql was applied before the fix.
-- Fixes: "infinite recursion detected in policy for relation patients"

CREATE OR REPLACE FUNCTION public.my_assigned_doctor_ids()
RETURNS SETOF UUID LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public AS $$
  SELECT assigned_doctor_id FROM public.patients WHERE user_id = auth.uid()
$$;

DROP POLICY IF EXISTS "Patients can view their doctor" ON public.doctors;
CREATE POLICY "Patients can view their doctor" ON public.doctors FOR SELECT USING (
  id IN (SELECT public.my_assigned_doctor_ids())
);
