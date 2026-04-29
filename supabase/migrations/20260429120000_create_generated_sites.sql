create table if not exists public.generated_sites (
  id uuid primary key default gen_random_uuid(),
  prospect_id uuid references public.cold_prospects(id) on delete set null,
  slug text not null,
  url text,
  status text not null default 'queued' check (
    status in ('queued', 'generating', 'review', 'ready_to_pitch', 'pitched', 'sold')
  ),
  deal_amount numeric(10, 2) default 0,
  created_at timestamptz not null default now()
);

create index if not exists generated_sites_status_idx on public.generated_sites(status);
create index if not exists generated_sites_prospect_id_idx on public.generated_sites(prospect_id);

alter table public.generated_sites enable row level security;

create policy "generated_sites_select_anon"
  on public.generated_sites for select
  to anon
  using (true);

create policy "generated_sites_insert_anon"
  on public.generated_sites for insert
  to anon
  with check (true);

create policy "generated_sites_update_anon"
  on public.generated_sites for update
  to anon
  using (true)
  with check (true);
