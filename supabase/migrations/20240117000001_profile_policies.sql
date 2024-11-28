-- Enable RLS on profiles table if not already enabled
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Allow users to insert their own profile
CREATE POLICY "Users can insert their own profile"
ON public.profiles
FOR INSERT
WITH CHECK (auth.uid()::text = id);

-- Allow users to view their own profile
CREATE POLICY "Users can view their own profile"
ON public.profiles
FOR SELECT
USING (auth.uid()::text = id);

-- Allow users to update their own profile
CREATE POLICY "Users can update their own profile"
ON public.profiles
FOR UPDATE
USING (auth.uid()::text = id);

-- Allow admins to view all profiles
CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    INNER JOIN private.roles r ON ur.role_id = r.id
    WHERE ur.user_id = auth.uid() AND r.name = 'ADMIN'
  )
);

-- Allow admins to update all profiles
CREATE POLICY "Admins can update all profiles"
ON public.profiles
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    INNER JOIN private.roles r ON ur.role_id = r.id
    WHERE ur.user_id = auth.uid() AND r.name = 'ADMIN'
  )
);

-- Allow service role to bypass RLS
ALTER TABLE public.profiles FORCE ROW LEVEL SECURITY;
