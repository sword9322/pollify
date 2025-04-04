-- Create a table to store site statistics
CREATE TABLE site_stats (
  id SERIAL PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  value INTEGER NOT NULL
);

-- Insert the initial visitors count
INSERT INTO site_stats (key, value) VALUES ('total_visitors', 0);

-- Create a function to increment the counter
CREATE OR REPLACE FUNCTION increment_visitor_count()
RETURNS INTEGER AS $$
DECLARE
  current_count INTEGER;
BEGIN
  UPDATE site_stats 
  SET value = value + 1 
  WHERE key = 'total_visitors'
  RETURNING value INTO current_count;
  
  RETURN current_count;
END;
$$ LANGUAGE plpgsql; 