-- ============================================================
-- Table: admin_users
-- Purpose: Controls which Supabase Auth users can access /admin
-- Run this in the Supabase SQL Editor (Dashboard > SQL Editor)
-- ============================================================

CREATE TABLE IF NOT EXISTS admin_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'writer' CHECK (role IN ('owner', 'editor', 'writer')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read admin_users (needed for login check)
CREATE POLICY "Authenticated users can read admin_users"
  ON admin_users FOR SELECT
  TO authenticated
  USING (true);

-- Only the service role can insert/update/delete (managed via admin panel)
-- No additional policies needed since the admin client uses service_role key

-- ============================================================
-- INSERT YOUR FIRST OWNER USER
-- Replace with your actual email and name
-- ============================================================
INSERT INTO admin_users (email, display_name, role)
VALUES ('cesaradrian660@gmail.com', 'Cesar Adrian', 'owner')
ON CONFLICT (email) DO NOTHING;
