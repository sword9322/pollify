-- Add created_at column to polls table
ALTER TABLE polls ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW());

-- Create function to delete old polls
CREATE OR REPLACE FUNCTION delete_old_polls()
RETURNS void AS $$
BEGIN
  DELETE FROM polls
  WHERE created_at < NOW() - INTERVAL '7 days'
  AND total_votes = 0;
END;
$$ LANGUAGE plpgsql;

-- Create a scheduled job to run the cleanup function
SELECT cron.schedule(
  'delete-old-polls',
  '0 0 * * *', -- Run at midnight every day
  $$
  SELECT delete_old_polls();
  $$
); 