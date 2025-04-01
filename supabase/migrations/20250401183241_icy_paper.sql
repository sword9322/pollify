/*
  # Create polls and votes tables

  1. New Tables
    - `polls`
      - `id` (uuid, primary key)
      - `question` (text)
      - `created_at` (timestamp)
    - `poll_options`
      - `id` (uuid, primary key)
      - `poll_id` (uuid, foreign key)
      - `text` (text)
    - `votes`
      - `id` (uuid, primary key)
      - `poll_id` (uuid, foreign key)
      - `option_id` (uuid, foreign key)
      - `created_at` (timestamp)
      - `ip_address` (text)

  2. Security
    - Enable RLS on all tables
    - Allow anyone to read polls and options
    - Allow anyone to create polls
    - Allow anyone to vote (with IP rate limiting)
*/

-- Create polls table
CREATE TABLE IF NOT EXISTS polls (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create poll options table
CREATE TABLE IF NOT EXISTS poll_options (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  poll_id uuid REFERENCES polls(id) ON DELETE CASCADE,
  text text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create votes table
CREATE TABLE IF NOT EXISTS votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  poll_id uuid REFERENCES polls(id) ON DELETE CASCADE,
  option_id uuid REFERENCES poll_options(id) ON DELETE CASCADE,
  ip_address text NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(poll_id, ip_address)
);

-- Enable RLS
ALTER TABLE polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE poll_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;

-- Policies for polls
CREATE POLICY "Anyone can read polls"
  ON polls
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can create polls"
  ON polls
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Policies for poll options
CREATE POLICY "Anyone can read poll options"
  ON poll_options
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can create poll options"
  ON poll_options
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Policies for votes
CREATE POLICY "Anyone can read votes"
  ON votes
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can vote once per poll"
  ON votes
  FOR INSERT
  TO public
  WITH CHECK (
    NOT EXISTS (
      SELECT 1 FROM votes
      WHERE poll_id = NEW.poll_id
      AND ip_address = NEW.ip_address
    )
  );