-- ============================================================================
-- Avaliação (anamnese) — tabelas, RLS e Storage de fotos
-- Somente ADITIVA: não altera nenhuma tabela/função/política existente.
-- Depende de: public.profiles, public.is_master(), public.is_active()
-- ============================================================================

-- 1) Avaliações -------------------------------------------------------------
create table if not exists public.assessments (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references public.profiles(id) on delete cascade,
  created_by    uuid references public.profiles(id) on delete set null,
  source        text not null check (source in ('public','self','master')),
  -- campos numéricos frequentes (consulta/ordenação); o restante fica em answers
  weight_kg     numeric(5,1) check (weight_kg    between 20 and 400),
  height_cm     numeric(4,1) check (height_cm    between 80 and 250),
  bf_scale_pct  numeric(3,1) check (bf_scale_pct between 2  and 70),   -- % gordura da balança (opcional)
  answers       jsonb not null default '{}'::jsonb
                check (jsonb_typeof(answers) = 'object' and octet_length(answers::text) <= 20000),
  -- LGPD: consentimento específico para dado de saúde (art. 11, I)
  consent_version text not null,
  consent_at      timestamptz not null,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists assessments_user_created_idx on public.assessments (user_id, created_at desc);

create or replace function public.assessments_touch()
returns trigger language plpgsql set search_path = '' as $$
begin new.updated_at := now(); return new; end $$;

drop trigger if exists assessments_touch on public.assessments;
create trigger assessments_touch before update on public.assessments
  for each row execute function public.assessments_touch();

alter table public.assessments enable row level security;

revoke all on public.assessments from anon, public;
grant select, insert, update, delete on public.assessments to authenticated;

-- cliente vê SÓ as suas; master vê todas
create policy assess_sel on public.assessments for select to authenticated
  using ( public.is_master() or (user_id = (select auth.uid()) and public.is_active()) );

-- cliente pode registrar uma nova avaliação PARA SI (source='self'); master para qualquer usuário.
-- (o formulário público não passa por aqui: grava a Edge Function com service_role)
create policy assess_ins on public.assessments for insert to authenticated
  with check (
    public.is_master()
    or ( user_id = (select auth.uid()) and created_by = (select auth.uid())
         and source = 'self' and public.is_active() )
  );

-- respostas não são editáveis pelo cliente (evita adulteração); só o master corrige
create policy assess_upd on public.assessments for update to authenticated
  using ( public.is_master() ) with check ( public.is_master() );

-- direito de eliminação (LGPD art. 18, VI): cliente apaga as suas; master apaga qualquer
create policy assess_del on public.assessments for delete to authenticated
  using ( public.is_master() or (user_id = (select auth.uid()) and public.is_active()) );

-- 2) Controle de abuso do formulário público ---------------------------------
-- Sem NENHUMA policy: só a Edge Function (service_role) lê/escreve.
create table if not exists public.intake_attempts (
  id         bigint generated always as identity primary key,
  kind       text not null check (kind in ('submit','resend')),
  ip_hash    text,
  email_hash text,
  created_at timestamptz not null default now()
);
create index if not exists intake_attempts_ip_idx    on public.intake_attempts (kind, ip_hash,    created_at desc);
create index if not exists intake_attempts_email_idx on public.intake_attempts (kind, email_hash, created_at desc);
alter table public.intake_attempts enable row level security;
revoke all on public.intake_attempts from anon, authenticated, public;

-- 3) Fotos (Storage privado) --------------------------------------------------
-- caminho: <user_id>/<assessment_id>/<front|back|left|right>.jpg
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('assessment-photos', 'assessment-photos', false, 3145728, array['image/jpeg'])
on conflict (id) do update
  set public = false, file_size_limit = 3145728, allowed_mime_types = array['image/jpeg'];

create policy photos_sel on storage.objects for select to authenticated
  using ( bucket_id = 'assessment-photos'
          and ( public.is_master()
                or ((storage.foldername(name))[1] = (select auth.uid())::text and public.is_active()) ) );

create policy photos_ins on storage.objects for insert to authenticated
  with check ( bucket_id = 'assessment-photos'
          and ( public.is_master()
                or ((storage.foldername(name))[1] = (select auth.uid())::text and public.is_active()) ) );

create policy photos_upd on storage.objects for update to authenticated
  using ( bucket_id = 'assessment-photos'
          and ( public.is_master()
                or ((storage.foldername(name))[1] = (select auth.uid())::text and public.is_active()) ) )
  with check ( bucket_id = 'assessment-photos'
          and ( public.is_master()
                or ((storage.foldername(name))[1] = (select auth.uid())::text and public.is_active()) ) );

create policy photos_del on storage.objects for delete to authenticated
  using ( bucket_id = 'assessment-photos'
          and ( public.is_master()
                or ((storage.foldername(name))[1] = (select auth.uid())::text and public.is_active()) ) );
