-- 1. Create Tables

CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT,
    qualification TEXT,
    target_course TEXT,
    countries TEXT[],
    budget INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE saved_universities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    university_name TEXT NOT NULL,
    country TEXT,
    course TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE loan_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    income INTEGER,
    has_coapplicant BOOLEAN DEFAULT false,
    has_collateral BOOLEAN DEFAULT false,
    eligibility TEXT,
    emi INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE user_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    profile_completed BOOLEAN DEFAULT false,
    loan_checked BOOLEAN DEFAULT false,
    checklist_completed BOOLEAN DEFAULT false,
    score INTEGER DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Enable Row Level Security (RLS)

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_universities ENABLE ROW LEVEL SECURITY;
ALTER TABLE loan_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;

-- 3. Create RLS Policies

-- Profiles Policies
CREATE POLICY "Users can view own profile" 
ON profiles FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" 
ON profiles FOR INSERT 
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
ON profiles FOR UPDATE 
USING (auth.uid() = id);

-- Saved Universities Policies
CREATE POLICY "Users can view own saved universities" 
ON saved_universities FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own saved universities" 
ON saved_universities FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own saved universities" 
ON saved_universities FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own saved universities" 
ON saved_universities FOR DELETE 
USING (auth.uid() = user_id);

-- Loan Profiles Policies
CREATE POLICY "Users can view own loan profiles" 
ON loan_profiles FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own loan profiles" 
ON loan_profiles FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own loan profiles" 
ON loan_profiles FOR UPDATE 
USING (auth.uid() = user_id);

-- User Progress Policies
CREATE POLICY "Users can view own progress" 
ON user_progress FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own progress" 
ON user_progress FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own progress" 
ON user_progress FOR UPDATE 
USING (auth.uid() = user_id);

-- 4. Create Postgres Trigger for New Users
-- Automatically creates a profile and a progress record when a user signs up.
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, created_at)
  VALUES (new.id, now());
  
  INSERT INTO public.user_progress (user_id, created_at, updated_at)
  VALUES (new.id, now(), now());
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
