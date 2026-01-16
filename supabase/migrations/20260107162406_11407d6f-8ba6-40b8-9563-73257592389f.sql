-- Add foreign key column to applicants table to link back to join_applications
ALTER TABLE public.applicants 
ADD COLUMN join_application_id uuid REFERENCES public.join_applications(id) ON DELETE SET NULL;

-- Create unique index to ensure one-to-one relationship
CREATE UNIQUE INDEX idx_applicants_join_application_id ON public.applicants(join_application_id) WHERE join_application_id IS NOT NULL;

-- Create function to auto-create applicant from join application
CREATE OR REPLACE FUNCTION public.create_applicant_from_join_application()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.applicants (
        full_name,
        email,
        phone,
        age,
        governorate,
        city,
        education,
        experience,
        motivation,
        status,
        join_application_id
    ) VALUES (
        NEW.name,
        NEW.email,
        NEW.phone,
        NEW.age,
        NEW.governorate,
        '', -- city to be filled by HR
        NEW.education,
        NEW.experience,
        NEW.motivation,
        'new'::applicant_status,
        NEW.id
    );
    
    RETURN NEW;
END;
$$;

-- Create trigger to auto-create applicant when join application is submitted
CREATE TRIGGER on_join_application_submitted
    AFTER INSERT ON public.join_applications
    FOR EACH ROW
    EXECUTE FUNCTION public.create_applicant_from_join_application();