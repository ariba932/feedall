-- Create custom types
CREATE TYPE user_role AS ENUM ('donor', 'recipient');
CREATE TYPE profile_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE listing_status AS ENUM ('available', 'reserved', 'completed');
CREATE TYPE donation_status AS ENUM ('pending', 'accepted', 'completed', 'cancelled');

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    email TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    avatar_url TEXT,
    organization_name TEXT,
    role user_role NOT NULL DEFAULT 'donor',
    status profile_status NOT NULL DEFAULT 'pending',
    phone_number TEXT,
    address TEXT
);

-- Create food_listings table
CREATE TABLE food_listings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    expiry_date TIMESTAMPTZ NOT NULL,
    pickup_location TEXT NOT NULL,
    status listing_status NOT NULL DEFAULT 'available',
    image_url TEXT,
    category TEXT,
    dietary_info TEXT[]
);

-- Create donations table
CREATE TABLE donations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    listing_id UUID NOT NULL REFERENCES food_listings(id) ON DELETE CASCADE,
    donor_id UUID NOT NULL REFERENCES profiles(id),
    recipient_id UUID NOT NULL REFERENCES profiles(id),
    status donation_status NOT NULL DEFAULT 'pending',
    pickup_time TIMESTAMPTZ,
    notes TEXT
);

-- Create indexes for better query performance
CREATE INDEX idx_food_listings_user_id ON food_listings(user_id);
CREATE INDEX idx_food_listings_status ON food_listings(status);
CREATE INDEX idx_donations_listing_id ON donations(listing_id);
CREATE INDEX idx_donations_donor_id ON donations(donor_id);
CREATE INDEX idx_donations_recipient_id ON donations(recipient_id);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE food_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone"
    ON profiles FOR SELECT
    USING (true);

CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id);

-- Food listings policies
CREATE POLICY "Food listings are viewable by everyone"
    ON food_listings FOR SELECT
    USING (true);

CREATE POLICY "Donors can create listings"
    ON food_listings FOR INSERT
    WITH CHECK (
        auth.uid() = user_id AND
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid()
            AND role = 'donor'
            AND status = 'approved'
        )
    );

CREATE POLICY "Donors can update own listings"
    ON food_listings FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Donors can delete own listings"
    ON food_listings FOR DELETE
    USING (auth.uid() = user_id);

-- Donations policies
CREATE POLICY "Users can view donations they're involved in"
    ON donations FOR SELECT
    USING (
        auth.uid() = donor_id OR
        auth.uid() = recipient_id
    );

CREATE POLICY "Recipients can create donations"
    ON donations FOR INSERT
    WITH CHECK (
        auth.uid() = recipient_id AND
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid()
            AND role = 'recipient'
            AND status = 'approved'
        )
    );

CREATE POLICY "Users can update donations they're involved in"
    ON donations FOR UPDATE
    USING (
        auth.uid() = donor_id OR
        auth.uid() = recipient_id
    );

-- Create triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_food_listings_updated_at
    BEFORE UPDATE ON food_listings
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_donations_updated_at
    BEFORE UPDATE ON donations
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();
