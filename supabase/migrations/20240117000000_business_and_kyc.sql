-- Create enum for document status
CREATE TYPE document_status AS ENUM (
  'PENDING_VERIFICATION',
  'VERIFIED',
  'REJECTED'
);

-- Create business_profiles table
CREATE TABLE IF NOT EXISTS public.business_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  tax_id TEXT NOT NULL,
  business_type TEXT NOT NULL,
  registration_number TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create kyc_documents table
CREATE TABLE IF NOT EXISTS public.kyc_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL,
  document_url TEXT NOT NULL,
  status document_status NOT NULL DEFAULT 'PENDING_VERIFICATION',
  verified_at TIMESTAMPTZ,
  verified_by UUID REFERENCES public.profiles(id),
  rejection_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.business_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kyc_documents ENABLE ROW LEVEL SECURITY;

-- Policies for business_profiles
CREATE POLICY "Users can view their own business profile"
  ON public.business_profiles
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own business profile"
  ON public.business_profiles
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all business profiles"
  ON public.business_profiles
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      INNER JOIN private.roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid() AND r.name = 'ADMIN'
    )
  );

-- Policies for kyc_documents
CREATE POLICY "Users can view their own documents"
  ON public.kyc_documents
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own documents"
  ON public.kyc_documents
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all documents"
  ON public.kyc_documents
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      INNER JOIN private.roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid() AND r.name = 'ADMIN'
    )
  );

CREATE POLICY "Admins can update document status"
  ON public.kyc_documents
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      INNER JOIN private.roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid() AND r.name = 'ADMIN'
    )
  );
