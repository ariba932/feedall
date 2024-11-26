-- Drop existing tables and functions if they exist
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP TABLE IF EXISTS public.profiles;
DROP TABLE IF EXISTS public.user_roles;
DROP TABLE IF EXISTS "private".roles;

-- Create a secure schema for our tables
CREATE SCHEMA IF NOT EXISTS "private";

-- Create a table for storing roles
CREATE TABLE IF NOT EXISTS "private".roles (
  id uuid primary key default uuid_generate_v4(),
  name text not null unique,
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Insert default roles
INSERT INTO "private".roles (name, description) VALUES
  ('ADMIN', 'System administrator with full access'),
  ('DONOR', 'Food donor who can contribute surplus food'),
  ('SERVICE_PROVIDER', 'Partner providing food-related services'),
  ('NGO', 'Non-profit organization that receives and distributes food'),
  ('LOGISTICS', 'Partner handling food transportation and delivery'),
  ('VOLUNTEER', 'Community volunteer')
ON CONFLICT (name) DO NOTHING;

-- Create a profiles table in the public schema
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  avatar_url text,
  organization_name text,
  phone text,
  address text,
  city text,
  state text,
  postal_code text,
  country text default 'US',
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create a user_roles junction table for many-to-many relationship
CREATE TABLE IF NOT EXISTS public.user_roles (
  user_id uuid references public.profiles(id) on delete cascade,
  role_id uuid references private.roles(id) on delete cascade,
  assigned_by uuid references public.profiles(id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (user_id, role_id)
);

-- Set up Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Public profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (TRUE);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "User roles are viewable by everyone"
  ON public.user_roles FOR SELECT
  USING (TRUE);

CREATE POLICY "Only admins can manage user roles"
  ON public.user_roles FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      INNER JOIN private.roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid() AND r.name = 'ADMIN'
    )
  );

-- Functions to manage roles
CREATE OR REPLACE FUNCTION public.get_user_roles(user_id uuid)
RETURNS SETOF text
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT r.name
  FROM public.user_roles ur
  INNER JOIN private.roles r ON ur.role_id = r.id
  WHERE ur.user_id = user_id;
$$;

CREATE OR REPLACE FUNCTION public.has_role(user_id uuid, role_name text)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles ur
    INNER JOIN private.roles r ON ur.role_id = r.id
    WHERE ur.user_id = user_id AND r.name = role_name
  );
$$;

CREATE OR REPLACE FUNCTION public.assign_role(target_user_id uuid, role_name text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.user_roles ur
    INNER JOIN private.roles r ON ur.role_id = r.id
    WHERE ur.user_id = auth.uid() AND r.name = 'ADMIN'
  ) THEN
    RAISE EXCEPTION 'Only administrators can assign roles';
  END IF;

  INSERT INTO public.user_roles (user_id, role_id, assigned_by)
  SELECT target_user_id, r.id, auth.uid()
  FROM private.roles r
  WHERE r.name = role_name
  ON CONFLICT (user_id, role_id) DO NOTHING;
END;
$$;

-- Trigger to handle updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER handle_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Function to create a profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$;

-- Trigger the function every time a user is created
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
