/*
  # Add Onboarding Fields to User Profiles

  1. Changes
    - Add `onboarding_completed` (boolean, default false)
    - Add `experience_level` (text, nullable, 'new' or 'existing')
    - Add `existing_platform` (text, nullable, platform user already uses)

  2. Security
    - Existing RLS policies cover these fields
    - Users can update their own onboarding fields
*/

-- Add onboarding fields
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'onboarding_completed'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN onboarding_completed boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'experience_level'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN experience_level text CHECK (experience_level IN ('new', 'existing'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'existing_platform'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN existing_platform text;
  END IF;
END $$;

-- Policy: Users can update their own onboarding fields
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
CREATE POLICY "Users can update own profile"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);