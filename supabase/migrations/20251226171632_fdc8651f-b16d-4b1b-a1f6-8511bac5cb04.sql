-- Create table for join applications
CREATE TABLE public.join_applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  age INTEGER NOT NULL,
  governorate TEXT NOT NULL,
  education TEXT NOT NULL,
  experience TEXT,
  motivation TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.join_applications ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert (public form)
CREATE POLICY "Anyone can submit join application" 
ON public.join_applications 
FOR INSERT 
WITH CHECK (true);

-- Only authenticated admins can view applications (for future admin panel)
CREATE POLICY "Authenticated users can view applications" 
ON public.join_applications 
FOR SELECT 
USING (auth.role() = 'authenticated');