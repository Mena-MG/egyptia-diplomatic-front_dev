-- Fix: Restrict join_applications SELECT to HR/admin only (was allowing any authenticated user)
DROP POLICY IF EXISTS "Authenticated users can view applications" ON public.join_applications;

CREATE POLICY "HR can view join applications" 
ON public.join_applications 
FOR SELECT 
USING (is_hr_or_admin(auth.uid()));

-- Add explicit deny for anonymous users on members table (defense in depth)
-- First ensure RLS is enabled (it should be, but confirming)
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;

-- The existing policy already restricts to HR/admin, which is correct
-- Anonymous users are denied by default when RLS is enabled and no matching policy exists