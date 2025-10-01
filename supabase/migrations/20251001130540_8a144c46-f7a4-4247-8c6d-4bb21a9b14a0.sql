-- Add amount column to tasks table for financial tracking
ALTER TABLE public.tasks 
ADD COLUMN IF NOT EXISTS amount numeric;