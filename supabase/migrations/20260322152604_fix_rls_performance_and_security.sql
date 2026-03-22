/*
  # Fix RLS Performance and Security Issues

  1. Optimizations
    - Optimize RLS policies to use (SELECT auth.uid()) instead of auth.uid()
    - This prevents re-evaluation for each row, improving query performance at scale
    - Set explicit search_path on functions for security
  
  2. Changes
    - Drop and recreate all RLS policies with optimized queries
    - Update functions with explicit search_path
    - Keep existing indexes (they will be used as data grows)
  
  3. Security
    - All policies remain functionally identical
    - Added explicit search_path to prevent search_path injection attacks
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can read own profile" ON user_profiles;
DROP POLICY IF EXISTS "Admin can read all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Admin can update all profiles" ON user_profiles;
DROP POLICY IF EXISTS "System can insert new profiles" ON user_profiles;

-- Recreate policies with optimized auth.uid() calls
CREATE POLICY "Users can read own profile"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) = id);

CREATE POLICY "Admin can read all profiles"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = (SELECT auth.uid())
      AND auth.users.email = 'nevry95@hotmail.se'
    )
  );

CREATE POLICY "Admin can update all profiles"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = (SELECT auth.uid())
      AND auth.users.email = 'nevry95@hotmail.se'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = (SELECT auth.uid())
      AND auth.users.email = 'nevry95@hotmail.se'
    )
  );

CREATE POLICY "System can insert new profiles"
  ON user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT auth.uid()) = id);

-- Update functions with explicit search_path for security
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, subscription_tier)
  VALUES (NEW.id, NEW.email, 'FREE');
  RETURN NEW;
END;
$$;
