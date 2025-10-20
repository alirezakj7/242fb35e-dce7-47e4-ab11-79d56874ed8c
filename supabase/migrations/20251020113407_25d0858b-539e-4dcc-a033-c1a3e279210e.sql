-- Enable pg_cron extension for scheduled jobs
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Schedule the auto-complete routine jobs function to run daily at midnight
SELECT cron.schedule(
  'auto-complete-routine-jobs-daily',
  '0 0 * * *', -- Every day at midnight
  $$
  SELECT
    net.http_post(
        url:='https://ipldxsnmecelhebazefx.supabase.co/functions/v1/auto-complete-routine-jobs',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlwbGR4c25tZWNlbGhlYmF6ZWZ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM3MTYxMjgsImV4cCI6MjA2OTI5MjEyOH0.9bjTNIchcCp8lH0YHR9JcYlToFmiX_nC9f_js4ilCPM"}'::jsonb,
        body:=concat('{"time": "', now(), '"}')::jsonb
    ) as request_id;
  $$
);
