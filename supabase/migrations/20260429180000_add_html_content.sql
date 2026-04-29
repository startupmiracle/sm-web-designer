-- Add HTML content storage and missing columns to generated_sites
alter table public.generated_sites
  add column if not exists html_content text,
  add column if not exists business_name text,
  add column if not exists category text,
  add column if not exists city text;
