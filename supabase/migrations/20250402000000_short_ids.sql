/*
  # Add short ID generation for polls

  This migration:
  1. Enables pgcrypto extension (if not already enabled)
  2. Creates a function to generate short, readable, unique IDs
  3. Adds a short_id column to the polls table
  4. Creates a trigger to automatically populate the short_id column
  5. Updates existing polls (if any) with short IDs
*/

-- Enable the pgcrypto extension
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Create a function to generate short, URL-friendly IDs
CREATE OR REPLACE FUNCTION generate_short_id()
RETURNS TEXT AS $$
DECLARE
  -- Use characters that are URL-safe and less prone to confusion
  -- Excluding similar-looking characters (0/O, 1/I/l, etc.)
  chars TEXT := 'abcdefghjkmnpqrstuvwxyz23456789';
  result TEXT := '';
  i INTEGER := 0;
  random_bytes BYTEA;
BEGIN
  -- Generate 6 characters for the ID (can be adjusted as needed)
  FOR i IN 1..6 LOOP
    -- Use strong randomness from pgcrypto
    random_bytes := gen_random_bytes(1);
    -- Convert to integer and use modulo to get index within chars
    result := result || substr(chars, 1 + (get_byte(random_bytes, 0) % length(chars)), 1);
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql VOLATILE;

-- Add a short_id column to the polls table
ALTER TABLE polls ADD COLUMN IF NOT EXISTS short_id TEXT UNIQUE;

-- Create an index for faster lookups
CREATE INDEX IF NOT EXISTS polls_short_id_idx ON polls(short_id);

-- Create a trigger to automatically generate short_id on insert
CREATE OR REPLACE FUNCTION set_short_id()
RETURNS TRIGGER AS $$
DECLARE
  proposed_id TEXT;
  attempts INTEGER := 0;
BEGIN
  -- Try up to 10 times to generate a unique ID
  WHILE attempts < 10 LOOP
    proposed_id := generate_short_id();
    BEGIN
      -- Attempt to set the short_id
      NEW.short_id := proposed_id;
      RETURN NEW;
    EXCEPTION
      -- If there's a unique violation, try again
      WHEN unique_violation THEN
        attempts := attempts + 1;
    END;
  END LOOP;
  
  -- If we've tried 10 times and still have an issue, raise an error
  RAISE EXCEPTION 'Failed to generate a unique short ID after % attempts', attempts;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger
DROP TRIGGER IF EXISTS trigger_set_short_id ON polls;
CREATE TRIGGER trigger_set_short_id
BEFORE INSERT ON polls
FOR EACH ROW
WHEN (NEW.short_id IS NULL)
EXECUTE FUNCTION set_short_id();

-- Update any existing polls with short IDs
UPDATE polls SET short_id = generate_short_id() WHERE short_id IS NULL; 