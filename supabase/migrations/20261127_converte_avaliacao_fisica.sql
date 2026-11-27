-- Converte as medições da antiga "Avaliação física" (user_docs.program.anam.evals) em avaliações (assessments).
-- Idempotente: não duplica (usa answers.converted_id). Não altera nem apaga os dados originais.
insert into public.assessments (user_id, created_by, source, weight_kg, height_cm, answers, consent_version, consent_at, created_at)
select d.user_id, d.user_id,
       case when e->>'by' = 'master' then 'master' else 'self' end,
       nullif(e->>'weight','')::numeric, nullif(e->>'height','')::numeric,
       jsonb_strip_nulls(jsonb_build_object(
         'weight', nullif(e->>'weight','')::numeric, 'height', nullif(e->>'height','')::numeric, 'rhr', nullif(e->>'rhr','')::numeric,
         'sex', coalesce(nullif(d.state->'body'->>'sex',''), nullif(d.program->'anam'->>'sex','')),
         'birth', coalesce(nullif(d.state->'body'->>'birth',''), nullif(d.program->'anam'->>'birth','')),
         'converted_from', 'avaliacao_fisica', 'converted_id', e->>'id'))
       || coalesce(e->'circ', '{}'::jsonb)
       || case when coalesce(e->'folds','{}'::jsonb) <> '{}'::jsonb then jsonb_build_object('folds', e->'folds', 'protocol', coalesce(e->>'protocol','jp3')) else '{}'::jsonb end,
       'convertido-avaliacao-fisica',
       ((e->>'date')::date + time '12:00') at time zone 'America/Recife',
       ((e->>'date')::date + time '12:00') at time zone 'America/Recife'
from public.user_docs d
cross join lateral jsonb_array_elements(coalesce(d.program->'anam'->'evals', '[]'::jsonb)) e
where e ? 'date'
  and not exists (select 1 from public.assessments a where a.user_id = d.user_id and a.answers->>'converted_id' = e->>'id');
