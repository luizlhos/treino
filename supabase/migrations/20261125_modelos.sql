-- Etapa 2 · Modelos prontos de treino editáveis pelo master.
-- Aditiva: só cria a tabela nova e as regras dela. Nada existente é alterado.
-- Sem linha na tabela = o app usa o modelo original (modelos.js).

create table if not exists public.workout_templates (
  id          text primary key check (id ~ '^[a-z0-9-]{2,40}$'),
  data        jsonb not null check (jsonb_typeof(data) = 'object' and pg_column_size(data) < 200000),
  updated_by  uuid references public.profiles(id) on delete set null,
  updated_at  timestamptz not null default now()
);

alter table public.workout_templates enable row level security;

-- todos os usuários ativos leem; só o master cria, altera ou restaura
drop policy if exists tpl_sel on public.workout_templates;
create policy tpl_sel on public.workout_templates for select to authenticated using (public.is_active());
drop policy if exists tpl_ins on public.workout_templates;
create policy tpl_ins on public.workout_templates for insert to authenticated with check (public.is_master());
drop policy if exists tpl_upd on public.workout_templates;
create policy tpl_upd on public.workout_templates for update to authenticated using (public.is_master()) with check (public.is_master());
drop policy if exists tpl_del on public.workout_templates;
create policy tpl_del on public.workout_templates for delete to authenticated using (public.is_master());

revoke all on public.workout_templates from anon;
revoke all on public.workout_templates from authenticated;
grant select, insert, update, delete on public.workout_templates to authenticated;
