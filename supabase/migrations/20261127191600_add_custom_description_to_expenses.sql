ALTER TABLE public.expenses
  ADD COLUMN IF NOT EXISTS custom_description text;
