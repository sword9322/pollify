-- Add a new key to site_stats for tracking polls
INSERT INTO site_stats (key, value) 
VALUES ('total_polls', 0)
ON CONFLICT (key) DO NOTHING;

-- Create or replace function to count the total number of polls
CREATE OR REPLACE FUNCTION get_total_polls()
RETURNS INTEGER AS $$
DECLARE
  poll_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO poll_count FROM polls;
  
  -- Update the site_stats table with the current count
  UPDATE site_stats 
  SET value = poll_count 
  WHERE key = 'total_polls';
  
  RETURN poll_count;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to update the total_polls count whenever a poll is created
CREATE OR REPLACE FUNCTION update_poll_count()
RETURNS TRIGGER AS $$
BEGIN
  -- Call get_total_polls to update the count
  PERFORM get_total_polls();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger
DROP TRIGGER IF EXISTS trigger_update_poll_count ON polls;
CREATE TRIGGER trigger_update_poll_count
AFTER INSERT ON polls
FOR EACH ROW
EXECUTE FUNCTION update_poll_count();

-- Initialize the counter with the current number of polls
SELECT get_total_polls(); 