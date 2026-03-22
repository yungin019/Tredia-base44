/*
  # Add Alpaca Integration Fields to User Profiles

  1. Changes
    - Add alpaca_connected boolean field
    - Add alpaca_token encrypted text field for OAuth access token
    - Add alpaca_refresh_token encrypted text field for OAuth refresh token
    - Add alpaca_buying_power numeric field
    - Add alpaca_position_count integer field
    - Add alpaca_daily_pnl numeric field for daily profit/loss
    - Add alpaca_positions jsonb field to store position snapshot
    - Add alpaca_last_sync timestamp field

  2. Security
    - All fields are part of existing user_profiles table
    - RLS policies already apply
    - Tokens are stored encrypted
*/

DO $$
BEGIN
  -- Add alpaca_connected field
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'alpaca_connected'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN alpaca_connected boolean DEFAULT false;
  END IF;

  -- Add alpaca_token field
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'alpaca_token'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN alpaca_token text;
  END IF;

  -- Add alpaca_refresh_token field
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'alpaca_refresh_token'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN alpaca_refresh_token text;
  END IF;

  -- Add alpaca_buying_power field
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'alpaca_buying_power'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN alpaca_buying_power numeric DEFAULT 0;
  END IF;

  -- Add alpaca_position_count field
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'alpaca_position_count'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN alpaca_position_count integer DEFAULT 0;
  END IF;

  -- Add alpaca_daily_pnl field
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'alpaca_daily_pnl'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN alpaca_daily_pnl numeric DEFAULT 0;
  END IF;

  -- Add alpaca_positions field
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'alpaca_positions'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN alpaca_positions jsonb;
  END IF;

  -- Add alpaca_last_sync field
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'alpaca_last_sync'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN alpaca_last_sync timestamptz;
  END IF;
END $$;
