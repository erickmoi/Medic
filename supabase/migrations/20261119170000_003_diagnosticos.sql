-- 003 · Catálogo de diagnósticos (CIE-10 y CIE-11) y ajuste de qué código mostrar en los documentos

create table public.diagnosticos (
  id          uuid primary key default gen_random_uuid(),
  nombre      text not null,
  cie10       text,
  cie11       text,
  frecuente   boolean not null default false,
  origen      text not null default 'usuario' check (origen in ('OMS','usuario')),
  validado    boolean not null default false,
  creado_por  uuid references public.medicos(id) on delete set null,
  creado_en   timestamptz not null default now(),
  unique (nombre)
);
create index diagnosticos_nombre_idx on public.diagnosticos (lower(nombre));
create index diagnosticos_creado_por_idx on public.diagnosticos (creado_por);

alter table public.diagnosticos enable row level security;
create policy "medicos leen diagnosticos" on public.diagnosticos for select to authenticated using ((select public.es_medico()));
grant select on public.diagnosticos to authenticated;

-- Agrega (o completa) un diagnóstico escrito por el médico; queda pendiente de validar
create or replace function public.agregar_diagnostico(p_nombre text, p_cie10 text, p_cie11 text)
returns public.diagnosticos
language plpgsql security definer set search_path = '' as $$
declare v uuid := public._exigir_medico(); r public.diagnosticos;
begin
  if coalesce(length(trim(p_nombre)),0) < 3 then raise exception 'Escribe el diagnóstico'; end if;
  insert into public.diagnosticos (nombre, cie10, cie11, origen, validado, creado_por)
  values (trim(p_nombre), nullif(upper(trim(p_cie10)),''), nullif(upper(trim(p_cie11)),''), 'usuario', false, v)
  on conflict (nombre) do update set
    cie10 = coalesce(public.diagnosticos.cie10, excluded.cie10),
    cie11 = coalesce(public.diagnosticos.cie11, excluded.cie11)
  returning * into r;
  perform public._log('agregar_diagnostico', 'diagnosticos', r.id::text, jsonb_build_object('nombre', p_nombre));
  return r;
end $$;

-- Ajustes permitidos: exámenes del certificado de salud y código de diagnóstico a mostrar
create or replace function public.guardar_ajuste(p_clave text, p_valor jsonb)
returns public.ajustes
language plpgsql security definer set search_path = '' as $$
declare v uuid := public._exigir_medico(); r public.ajustes;
begin
  if p_clave not in ('salud_examenes','codigo_diagnostico') then raise exception 'Ajuste no permitido'; end if;
  if p_clave = 'codigo_diagnostico' and p_valor #>> '{}' not in ('ambos','cie10','cie11') then
    raise exception 'Valor no válido';
  end if;
  insert into public.ajustes (clave, valor, actualizado_en) values (p_clave, p_valor, now())
  on conflict (clave) do update set valor = excluded.valor, actualizado_en = now() returning * into r;
  perform public._log('guardar_ajuste', 'ajustes', p_clave, p_valor);
  return r;
end $$;

insert into public.ajustes (clave, valor) values ('codigo_diagnostico', '"ambos"'::jsonb)
on conflict (clave) do nothing;

revoke execute on function public.agregar_diagnostico(text, text, text) from public, anon;
grant execute on function public.agregar_diagnostico(text, text, text) to authenticated;
