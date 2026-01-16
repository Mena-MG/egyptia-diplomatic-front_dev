-- =====================================================
-- EGYPTIAN DIPLOMATIC FRONT - COMPLETE HR SYSTEM SCHEMA
-- =====================================================

-- 1. User Roles Enum and Table
CREATE TYPE public.app_role AS ENUM ('admin', 'hr');

CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    created_by UUID,
    UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function for role checking (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Function to check if user is HR or Admin
CREATE OR REPLACE FUNCTION public.is_hr_or_admin(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role IN ('admin', 'hr')
  )
$$;

-- RLS Policies for user_roles
CREATE POLICY "Admins can manage user roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- 2. HR User Profiles
CREATE TABLE public.hr_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    avatar_url TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.hr_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "HR users can view all profiles"
ON public.hr_profiles
FOR SELECT
TO authenticated
USING (public.is_hr_or_admin(auth.uid()));

CREATE POLICY "Admins can manage HR profiles"
ON public.hr_profiles
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can update own profile"
ON public.hr_profiles
FOR UPDATE
TO authenticated
USING (user_id = auth.uid());

-- 3. Committees
CREATE TABLE public.committees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name_en TEXT NOT NULL,
    name_ar TEXT NOT NULL,
    description_en TEXT,
    description_ar TEXT,
    head_member_id UUID,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    created_by UUID
);

ALTER TABLE public.committees ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view active committees"
ON public.committees
FOR SELECT
USING (is_active = true);

CREATE POLICY "HR can manage committees"
ON public.committees
FOR ALL
TO authenticated
USING (public.is_hr_or_admin(auth.uid()))
WITH CHECK (public.is_hr_or_admin(auth.uid()));

-- 4. Applicants Status Enum
CREATE TYPE public.applicant_status AS ENUM (
    'new', 'screening', 'interview_scheduled', 'interview_completed', 
    'accepted', 'rejected', 'waitlist', 'onboarding', 'withdrawn'
);

-- 5. Applicants (Extended from join_applications)
CREATE TABLE public.applicants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    -- Personal Info
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    age INTEGER NOT NULL,
    city TEXT NOT NULL,
    governorate TEXT NOT NULL,
    -- Education & Experience
    education TEXT NOT NULL,
    experience TEXT,
    skills TEXT[],
    -- Application Details
    committee_preference UUID REFERENCES public.committees(id),
    motivation TEXT NOT NULL,
    availability TEXT,
    -- Attachments (URLs to storage)
    cv_url TEXT,
    attachments TEXT[],
    -- Status & Tracking
    status applicant_status NOT NULL DEFAULT 'new',
    screening_score INTEGER CHECK (screening_score >= 0 AND screening_score <= 100),
    screening_notes TEXT,
    screened_by UUID,
    screened_at TIMESTAMP WITH TIME ZONE,
    -- Reference number
    reference_number TEXT UNIQUE,
    -- Audit
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.applicants ENABLE ROW LEVEL SECURITY;

-- Generate reference number trigger
CREATE OR REPLACE FUNCTION public.generate_applicant_reference()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    NEW.reference_number := 'EDF-' || TO_CHAR(NOW(), 'YYYY') || '-' || 
        LPAD(FLOOR(RANDOM() * 100000)::TEXT, 5, '0');
    RETURN NEW;
END;
$$;

CREATE TRIGGER set_applicant_reference
    BEFORE INSERT ON public.applicants
    FOR EACH ROW
    EXECUTE FUNCTION public.generate_applicant_reference();

CREATE POLICY "Anyone can submit application"
ON public.applicants
FOR INSERT
WITH CHECK (true);

CREATE POLICY "HR can view all applications"
ON public.applicants
FOR SELECT
TO authenticated
USING (public.is_hr_or_admin(auth.uid()));

CREATE POLICY "HR can update applications"
ON public.applicants
FOR UPDATE
TO authenticated
USING (public.is_hr_or_admin(auth.uid()));

-- 6. Interview Status Enum
CREATE TYPE public.interview_status AS ENUM (
    'scheduled', 'completed', 'cancelled', 'no_show', 'rescheduled'
);

-- 7. Interviews
CREATE TABLE public.interviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    applicant_id UUID REFERENCES public.applicants(id) ON DELETE CASCADE NOT NULL,
    interviewer_id UUID REFERENCES public.hr_profiles(id),
    -- Scheduling
    scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
    duration_minutes INTEGER NOT NULL DEFAULT 30,
    location TEXT,
    meeting_link TEXT,
    status interview_status NOT NULL DEFAULT 'scheduled',
    -- Scoring (0-10 scale, total can be 0-50)
    score_communication INTEGER CHECK (score_communication >= 0 AND score_communication <= 10),
    score_motivation INTEGER CHECK (score_motivation >= 0 AND score_motivation <= 10),
    score_skills INTEGER CHECK (score_skills >= 0 AND score_skills <= 10),
    score_culture_fit INTEGER CHECK (score_culture_fit >= 0 AND score_culture_fit <= 10),
    score_overall INTEGER CHECK (score_overall >= 0 AND score_overall <= 10),
    total_score INTEGER GENERATED ALWAYS AS (
        COALESCE(score_communication, 0) + COALESCE(score_motivation, 0) + 
        COALESCE(score_skills, 0) + COALESCE(score_culture_fit, 0) + 
        COALESCE(score_overall, 0)
    ) STORED,
    -- Evaluation
    notes TEXT,
    recommendation TEXT CHECK (recommendation IN ('accept', 'reject', 'waitlist')),
    is_draft BOOLEAN NOT NULL DEFAULT true,
    -- Audit
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    created_by UUID
);

ALTER TABLE public.interviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "HR can manage interviews"
ON public.interviews
FOR ALL
TO authenticated
USING (public.is_hr_or_admin(auth.uid()))
WITH CHECK (public.is_hr_or_admin(auth.uid()));

-- 8. Member Status Enum
CREATE TYPE public.member_status AS ENUM (
    'active', 'inactive', 'suspended', 'on_leave', 'offboarded'
);

-- 9. Members
CREATE TABLE public.members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    -- Link to original application
    applicant_id UUID REFERENCES public.applicants(id) UNIQUE,
    -- Personal Info
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    avatar_url TEXT,
    -- Committee Assignment
    committee_id UUID REFERENCES public.committees(id),
    role_title TEXT,
    -- Status
    status member_status NOT NULL DEFAULT 'active',
    join_date DATE NOT NULL DEFAULT CURRENT_DATE,
    -- Onboarding
    onboarding_completed BOOLEAN NOT NULL DEFAULT false,
    onboarding_checklist JSONB DEFAULT '[]'::jsonb,
    -- Stats
    attendance_rate DECIMAL(5,2) DEFAULT 0,
    -- Audit
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    created_by UUID
);

ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "HR can manage members"
ON public.members
FOR ALL
TO authenticated
USING (public.is_hr_or_admin(auth.uid()))
WITH CHECK (public.is_hr_or_admin(auth.uid()));

-- 10. Monthly Evaluations
CREATE TABLE public.monthly_evaluations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID REFERENCES public.members(id) ON DELETE CASCADE NOT NULL,
    evaluation_month DATE NOT NULL,
    -- 5 Criteria (0-10 each, total 0-50)
    attendance_commitment INTEGER NOT NULL CHECK (attendance_commitment >= 0 AND attendance_commitment <= 10),
    task_execution INTEGER NOT NULL CHECK (task_execution >= 0 AND task_execution <= 10),
    team_collaboration INTEGER NOT NULL CHECK (team_collaboration >= 0 AND team_collaboration <= 10),
    initiative_growth INTEGER NOT NULL CHECK (initiative_growth >= 0 AND initiative_growth <= 10),
    policy_compliance INTEGER NOT NULL CHECK (policy_compliance >= 0 AND policy_compliance <= 10),
    -- Auto-calculated total
    total_score INTEGER GENERATED ALWAYS AS (
        attendance_commitment + task_execution + team_collaboration + 
        initiative_growth + policy_compliance
    ) STORED,
    -- Notes
    evaluator_notes TEXT,
    evaluator_id UUID REFERENCES public.hr_profiles(id),
    -- Status
    is_submitted BOOLEAN NOT NULL DEFAULT false,
    -- Audit
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    -- Prevent duplicate evaluations for same member/month
    UNIQUE (member_id, evaluation_month)
);

ALTER TABLE public.monthly_evaluations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "HR can manage evaluations"
ON public.monthly_evaluations
FOR ALL
TO authenticated
USING (public.is_hr_or_admin(auth.uid()))
WITH CHECK (public.is_hr_or_admin(auth.uid()));

-- 11. Recognition Action Types
CREATE TYPE public.recognition_type AS ENUM (
    'appreciation', 'award', 'certificate', 'promotion', 'bonus', 'public_recognition'
);

-- 12. Recognition Actions
CREATE TABLE public.recognition_actions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID REFERENCES public.members(id) ON DELETE CASCADE NOT NULL,
    recognition_type recognition_type NOT NULL,
    reason TEXT NOT NULL,
    action_date DATE NOT NULL DEFAULT CURRENT_DATE,
    evidence_urls TEXT[],
    approved_by UUID REFERENCES public.hr_profiles(id),
    -- Audit
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    created_by UUID
);

ALTER TABLE public.recognition_actions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "HR can manage recognition"
ON public.recognition_actions
FOR ALL
TO authenticated
USING (public.is_hr_or_admin(auth.uid()))
WITH CHECK (public.is_hr_or_admin(auth.uid()));

-- 13. Disciplinary Action Types
CREATE TYPE public.disciplinary_type AS ENUM (
    'verbal_warning', 'written_warning', 'final_warning', 'suspension', 'termination'
);

-- 14. Disciplinary Actions
CREATE TABLE public.disciplinary_actions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID REFERENCES public.members(id) ON DELETE CASCADE NOT NULL,
    disciplinary_type disciplinary_type NOT NULL,
    reason TEXT NOT NULL,
    action_date DATE NOT NULL DEFAULT CURRENT_DATE,
    evidence_urls TEXT[],
    outcome TEXT,
    approved_by UUID REFERENCES public.hr_profiles(id),
    -- Audit
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    created_by UUID
);

ALTER TABLE public.disciplinary_actions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "HR can manage disciplinary"
ON public.disciplinary_actions
FOR ALL
TO authenticated
USING (public.is_hr_or_admin(auth.uid()))
WITH CHECK (public.is_hr_or_admin(auth.uid()));

-- 15. Application Notes (Internal)
CREATE TABLE public.application_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    applicant_id UUID REFERENCES public.applicants(id) ON DELETE CASCADE NOT NULL,
    note TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    created_by UUID REFERENCES public.hr_profiles(id)
);

ALTER TABLE public.application_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "HR can manage notes"
ON public.application_notes
FOR ALL
TO authenticated
USING (public.is_hr_or_admin(auth.uid()))
WITH CHECK (public.is_hr_or_admin(auth.uid()));

-- 16. Updated At Trigger Function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Apply updated_at triggers
CREATE TRIGGER update_hr_profiles_updated_at
    BEFORE UPDATE ON public.hr_profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_committees_updated_at
    BEFORE UPDATE ON public.committees
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_applicants_updated_at
    BEFORE UPDATE ON public.applicants
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_interviews_updated_at
    BEFORE UPDATE ON public.interviews
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_members_updated_at
    BEFORE UPDATE ON public.members
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_monthly_evaluations_updated_at
    BEFORE UPDATE ON public.monthly_evaluations
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_recognition_actions_updated_at
    BEFORE UPDATE ON public.recognition_actions
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_disciplinary_actions_updated_at
    BEFORE UPDATE ON public.disciplinary_actions
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 17. Insert default committees
INSERT INTO public.committees (name_en, name_ar, description_en, description_ar) VALUES
    ('Human Resources', 'لجنة إدارة الموارد البشرية', 'Responsible for recruitment, training, and member management', 'مسؤولة عن التوظيف والتدريب وإدارة الأعضاء'),
    ('Public Relations', 'لجنة العلاقات العامة', 'Manages external communications and partnerships', 'تدير الاتصالات الخارجية والشراكات'),
    ('Organization', 'لجنة التنظيم', 'Handles event planning and logistics', 'تتولى تخطيط الفعاليات والخدمات اللوجستية'),
    ('Training & Education', 'لجنة التدريب والتثقيف', 'Develops training programs and workshops', 'تطور برامج التدريب وورش العمل'),
    ('Media & Press', 'اللجنة الإعلامية والصحافة', 'Manages media coverage and press releases', 'تدير التغطية الإعلامية والبيانات الصحفية'),
    ('Digital Transformation', 'لجنة التحول الرقمي', 'Handles technology and digital initiatives', 'تتولى التكنولوجيا والمبادرات الرقمية'),
    ('Culture & Arts', 'لجنة الثقافة والفنون', 'Organizes cultural activities and arts programs', 'تنظم الأنشطة الثقافية وبرامج الفنون');