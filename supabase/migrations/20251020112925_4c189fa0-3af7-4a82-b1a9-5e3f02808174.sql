-- Add completion tracking to routine_jobs table
ALTER TABLE public.routine_jobs
ADD COLUMN IF NOT EXISTS completions jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS last_payout_date date;

COMMENT ON COLUMN public.routine_jobs.completions IS 'Array of completion dates to track monthly progress';
COMMENT ON COLUMN public.routine_jobs.last_payout_date IS 'Last date when earnings were paid out';