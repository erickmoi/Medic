-- 006 · Logo del médico en los documentos: símbolo médico (por defecto), iniciales o imagen propia

alter table public.medicos
  add column logo_tipo text not null default 'simbolo' check (logo_tipo in ('simbolo','iniciales','imagen')),
  add column logo_path text;

create or replace function public.actualizar_mi_perfil(p jsonb) returns public.medicos
language plpgsql security definer set search_path = '' as $$
declare v uuid := public._exigir_medico(); r public.medicos;
begin
  if p ? 'logo_tipo' and p->>'logo_tipo' not in ('simbolo','iniciales','imagen') then
    raise exception 'Tipo de logo no válido';
  end if;
  update public.medicos set
    telefono = coalesce(p->>'telefono', telefono),
    correo_contacto = coalesce(p->>'correo_contacto', correo_contacto),
    direccion = coalesce(p->>'direccion', direccion),
    ciudad = coalesce(nullif(p->>'ciudad',''), ciudad),
    especialidad = coalesce(nullif(p->>'especialidad',''), especialidad),
    firma_path = case when p ? 'firma_path' then nullif(p->>'firma_path','') else firma_path end,
    sello_path = case when p ? 'sello_path' then nullif(p->>'sello_path','') else sello_path end,
    logo_path  = case when p ? 'logo_path'  then nullif(p->>'logo_path','')  else logo_path end,
    logo_tipo  = coalesce(nullif(p->>'logo_tipo',''), logo_tipo),
    actualizado_en = now()
  where id = v returning * into r;
  perform public._log('actualizar_perfil', 'medicos', v::text, p - 'firma_path' - 'sello_path' - 'logo_path');
  return r;
end $$;

-- Los logos (no las firmas ni los sellos) los puede ver el otro médico, para que salgan en sus documentos
create policy "medicos leen logos" on storage.objects for select to authenticated
  using (bucket_id = 'firmas' and (storage.filename(name)) like 'logo-%' and (select public.es_medico()));
