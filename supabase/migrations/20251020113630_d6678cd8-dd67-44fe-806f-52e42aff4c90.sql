-- Add payment_day column to routine_jobs table
ALTER TABLE public.routine_jobs
ADD COLUMN IF NOT EXISTS payment_day integer;

COMMENT ON COLUMN public.routine_jobs.payment_day IS 'Day of month (1-31) for monthly frequency, day of week (0-6) for weekly frequency';

-- Drop the completions and last_payout_date columns as they are no longer needed
ALTER TABLE public.routine_jobs
DROP COLUMN IF EXISTS completions,
DROP COLUMN IF EXISTS last_payout_date;