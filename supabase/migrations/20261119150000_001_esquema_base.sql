-- =====================================================================
-- 001 · Esquema base de Medic (formatos médicos)
-- Médicos: Dr. Erick Moisés Díaz Chica y Dra. Sara Raquel Campos Sánchez.
-- Regla general: las tablas solo se LEEN con RLS; toda ESCRITURA pasa por
-- funciones RPC (security definer) que validan que quien llama es médico.
-- Ninguna tabla queda expuesta a "anon".
-- =====================================================================

-- ---------- Médicos permitidos (lista cerrada de quién puede registrarse)
create table public.medicos_permitidos (
  email        text primary key,
  nombre       text not null,
  titulo       text not null check (titulo in ('Dr.','Dra.')),
  jvpm         text not null,
  iniciales    text not null
);
comment on table public.medicos_permitidos is 'Solo estos correos pueden crear cuenta en la app.';

insert into public.medicos_permitidos (email, nombre, titulo, jvpm, iniciales) values
  ('moises.diazzch@gmail.com', 'Erick Moisés Díaz Chica',       'Dr.',  '24508', 'ED'),
  ('sary290398@gmail.com',     'Sara Raquel Campos Sánchez',    'Dra.', '24509', 'SC');

-- ---------- Perfil de cada médico
create table public.medicos (
  id               uuid primary key references auth.users(id) on delete cascade,
  email            text not null unique,
  nombre           text not null,
  titulo           text not null check (titulo in ('Dr.','Dra.')),
  profesion        text not null,                      -- 'Doctor en Medicina' / 'Doctora en Medicina'
  especialidad     text not null default 'Medicina General',
  jvpm             text not null,
  iniciales        text not null,
  telefono         text,
  correo_contacto  text,
  direccion        text,
  ciudad           text not null default 'San Salvador',
  firma_path       text,                               -- ruta en Storage (bucket privado "firmas")
  sello_path       text,
  creado_en        timestamptz not null default now(),
  actualizado_en   timestamptz not null default now()
);

-- ---------- Pacientes (compartidos entre los médicos)
create table public.pacientes (
  id                uuid primary key default gen_random_uuid(),
  nombre            text not null check (length(trim(nombre)) > 2),
  fecha_nacimiento  date,
  sexo              text check (sexo in ('F','M')),
  dui               text,
  telefono          text,
  direccion         text,
  alergias          text,
  peso_kg           numeric(5,2),
  notas             text,
  creado_por        uuid references public.medicos(id) on delete set null,
  creado_en         timestamptz not null default now(),
  actualizado_en    timestamptz not null default now()
);
create index pacientes_nombre_idx on public.pacientes (lower(nombre));
create index pacientes_creado_por_idx on public.pacientes (creado_por);

-- ---------- Documentos emitidos
create table public.documentos (
  id                uuid primary key default gen_random_uuid(),
  medico_id         uuid not null references public.medicos(id) on delete restrict,
  paciente_id       uuid references public.pacientes(id) on delete set null,
  tipo              text not null check (tipo in ('receta','estudios','incapacidad','constancia','salud','defuncion')),
  correlativo       integer not null,
  codigo            text not null,                     -- p. ej. R-0001
  estado            text not null default 'emitido' check (estado in ('emitido','anulado')),
  tamano            text not null default 'carta' check (tamano in ('carta','media_carta')),
  con_firma         boolean not null default true,
  contenido         jsonb not null default '{}'::jsonb, -- datos del formulario
  homologado        boolean not null default false,    -- incapacidad / defunción
  homologado_fecha  date,
  anulado_motivo    text,
  emitido_en        timestamptz not null default now(),
  unique (medico_id, tipo, correlativo)
);
create index documentos_medico_idx   on public.documentos (medico_id, emitido_en desc);
create index documentos_paciente_idx on public.documentos (paciente_id, emitido_en desc);

-- Último correlativo por médico y tipo (se incrementa de forma atómica)
create table public.correlativos (
  medico_id  uuid not null references public.medicos(id) on delete cascade,
  tipo       text not null,
  ultimo     integer not null default 0,
  primary key (medico_id, tipo)
);

-- ---------- Catálogo de medicamentos
create table public.medicamentos (
  id          uuid primary key default gen_random_uuid(),
  generico    text not null,
  grupo       text,
  atc         text,
  origen      text not null default 'usuario' check (origen in ('LOM SRS 2025','usuario')),
  validado    boolean not null default false,
  creado_por  uuid references public.medicos(id) on delete set null,
  creado_en   timestamptz not null default now(),
  unique (generico)
);
create index medicamentos_creado_por_idx on public.medicamentos (creado_por);

create table public.presentaciones (
  id              uuid primary key default gen_random_uuid(),
  medicamento_id  uuid not null references public.medicamentos(id) on delete cascade,
  descripcion     text not null,                       -- '500 mg tableta'
  via             text,
  origen          text not null default 'usuario' check (origen in ('LOM SRS 2025','usuario')),
  validado        boolean not null default false,
  unique (medicamento_id, descripcion)
);

-- Esquemas de dosificación (de la hoja de tratamientos según GPC)
create table public.esquemas (
  id              uuid primary key default gen_random_uuid(),
  medicamento_id  uuid not null references public.medicamentos(id) on delete cascade,
  presentacion_id uuid references public.presentaciones(id) on delete set null,
  poblacion       text not null check (poblacion in ('Adulto','Niño')),
  diagnostico     text,
  grupo           text,
  linea           text,
  dosis           numeric,
  unidad          text,
  via             text,
  frecuencia      text,
  tomas_dia       numeric,
  dias            numeric,
  cantidad_texto  text,
  condicion       text,
  observacion     text,
  favorito        boolean not null default false,
  creado_en       timestamptz not null default now()
);
create index esquemas_medicamento_idx  on public.esquemas (medicamento_id);
create index esquemas_presentacion_idx on public.esquemas (presentacion_id);

-- ---------- Catálogo de estudios (laboratorio y gabinete)
create table public.estudios (
  id           uuid primary key default gen_random_uuid(),
  tipo         text not null check (tipo in ('laboratorio','gabinete')),
  grupo        text not null,
  nombre       text not null,
  preparacion  text,
  activo       boolean not null default true,
  unique (tipo, nombre)
);

-- ---------- Ajustes compartidos (clave → valor)
create table public.ajustes (
  clave           text primary key,
  valor           jsonb not null,
  actualizado_en  timestamptz not null default now()
);
insert into public.ajustes (clave, valor) values
  ('salud_examenes', '["Hemograma completo","Examen general de orina","Examen general de heces"]'::jsonb);

-- ---------- Bitácora
create table public.bitacora (
  id          bigint generated always as identity primary key,
  usuario_id  uuid references public.medicos(id) on delete set null,
  accion      text not null,
  entidad     text,
  entidad_id  text,
  detalle     jsonb,
  creado_en   timestamptz not null default now()
);
create index bitacora_usuario_idx on public.bitacora (usuario_id, creado_en desc);

-- =====================================================================
-- Funciones auxiliares
-- =====================================================================
create or replace function public.es_medico()
returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists (select 1 from public.medicos m where m.id = (select auth.uid()));
$$;

create or replace function public._exigir_medico()
returns uuid
language plpgsql stable security definer set search_path = ''
as $$
declare v uuid := (select auth.uid());
begin
  if v is null or not exists (select 1 from public.medicos where id = v) then
    raise exception 'No autorizado' using errcode = '42501';
  end if;
  return v;
end $$;

create or replace function public._log(p_accion text, p_entidad text, p_id text, p_detalle jsonb default null)
returns void
language sql security definer set search_path = ''
as $$
  insert into public.bitacora (usuario_id, accion, entidad, entidad_id, detalle)
  values ((select auth.uid()), p_accion, p_entidad, p_id, p_detalle);
$$;

-- =====================================================================
-- Registro: solo correos permitidos; el perfil se crea solo
-- =====================================================================
create or replace function public._antes_de_crear_usuario()
returns trigger
language plpgsql security definer set search_path = ''
as $$
begin
  if not exists (select 1 from public.medicos_permitidos p where lower(p.email) = lower(new.email)) then
    raise exception 'Este correo no está autorizado para usar la app';
  end if;
  return new;
end $$;

create or replace function public._despues_de_crear_usuario()
returns trigger
language plpgsql security definer set search_path = ''
as $$
declare p public.medicos_permitidos;
begin
  select * into p from public.medicos_permitidos where lower(email) = lower(new.email);
  insert into public.medicos (id, email, nombre, titulo, profesion, jvpm, iniciales, correo_contacto)
  values (new.id, lower(new.email), p.nombre, p.titulo,
          case when p.titulo = 'Dra.' then 'Doctora en Medicina' else 'Doctor en Medicina' end,
          p.jvpm, p.iniciales, lower(new.email))
  on conflict (id) do nothing;
  return new;
end $$;

create trigger medic_antes_crear_usuario
  before insert on auth.users
  for each row execute function public._antes_de_crear_usuario();

create trigger medic_despues_crear_usuario
  after insert on auth.users
  for each row execute function public._despues_de_crear_usuario();

-- =====================================================================
-- RPC de lectura de cuenta
-- =====================================================================
create or replace function public.mi_cuenta()
returns public.medicos
language sql stable security definer set search_path = ''
as $$
  select * from public.medicos where id = (select auth.uid());
$$;

-- =====================================================================
-- RPC de escritura
-- =====================================================================
create or replace function public.actualizar_mi_perfil(p jsonb)
returns public.medicos
language plpgsql security definer set search_path = ''
as $$
declare v uuid := public._exigir_medico(); r public.medicos;
begin
  update public.medicos set
    telefono        = coalesce(p->>'telefono', telefono),
    correo_contacto = coalesce(p->>'correo_contacto', correo_contacto),
    direccion       = coalesce(p->>'direccion', direccion),
    ciudad          = coalesce(nullif(p->>'ciudad',''), ciudad),
    especialidad    = coalesce(nullif(p->>'especialidad',''), especialidad),
    firma_path      = case when p ? 'firma_path' then nullif(p->>'firma_path','') else firma_path end,
    sello_path      = case when p ? 'sello_path' then nullif(p->>'sello_path','') else sello_path end,
    actualizado_en  = now()
  where id = v
  returning * into r;
  perform public._log('actualizar_perfil', 'medicos', v::text, p - 'firma_path' - 'sello_path');
  return r;
end $$;

create or replace function public.guardar_paciente(p jsonb)
returns public.pacientes
language plpgsql security definer set search_path = ''
as $$
declare v uuid := public._exigir_medico(); r public.pacientes; pid uuid := nullif(p->>'id','')::uuid;
begin
  if coalesce(length(trim(p->>'nombre')),0) < 3 then
    raise exception 'El nombre del paciente es obligatorio';
  end if;
  if pid is null then
    insert into public.pacientes (nombre, fecha_nacimiento, sexo, dui, telefono, direccion, alergias, peso_kg, notas, creado_por)
    values (trim(p->>'nombre'), nullif(p->>'fecha_nacimiento','')::date, nullif(p->>'sexo',''),
            nullif(p->>'dui',''), nullif(p->>'telefono',''), nullif(p->>'direccion',''),
            nullif(p->>'alergias',''), nullif(p->>'peso_kg','')::numeric, nullif(p->>'notas',''), v)
    returning * into r;
    perform public._log('crear_paciente', 'pacientes', r.id::text, null);
  else
    update public.pacientes set
      nombre = trim(p->>'nombre'),
      fecha_nacimiento = nullif(p->>'fecha_nacimiento','')::date,
      sexo = nullif(p->>'sexo',''), dui = nullif(p->>'dui',''),
      telefono = nullif(p->>'telefono',''), direccion = nullif(p->>'direccion',''),
      alergias = nullif(p->>'alergias',''), peso_kg = nullif(p->>'peso_kg','')::numeric,
      notas = nullif(p->>'notas',''), actualizado_en = now()
    where id = pid
    returning * into r;
    if r.id is null then raise exception 'Paciente no encontrado'; end if;
    perform public._log('editar_paciente', 'pacientes', r.id::text, null);
  end if;
  return r;
end $$;

-- Emite un documento con correlativo atómico por médico y tipo
create or replace function public.emitir_documento(
  p_tipo text, p_paciente uuid, p_tamano text, p_con_firma boolean, p_contenido jsonb)
returns public.documentos
language plpgsql security definer set search_path = ''
as $$
declare
  v uuid := public._exigir_medico();
  n integer;
  pref text;
  r public.documentos;
begin
  pref := case p_tipo
    when 'receta' then 'R' when 'estudios' then 'EST' when 'incapacidad' then 'INC'
    when 'constancia' then 'CON' when 'salud' then 'SAL' when 'defuncion' then 'DEF'
    else null end;
  if pref is null then raise exception 'Tipo de documento no válido'; end if;

  insert into public.correlativos (medico_id, tipo, ultimo) values (v, p_tipo, 1)
  on conflict (medico_id, tipo) do update set ultimo = public.correlativos.ultimo + 1
  returning ultimo into n;

  insert into public.documentos (medico_id, paciente_id, tipo, correlativo, codigo, tamano, con_firma, contenido)
  values (v, p_paciente, p_tipo, n, pref || '-' || lpad(n::text, 4, '0'),
          coalesce(p_tamano, 'carta'), coalesce(p_con_firma, true), coalesce(p_contenido, '{}'::jsonb))
  returning * into r;

  perform public._log('emitir_documento', 'documentos', r.id::text, jsonb_build_object('codigo', r.codigo));
  return r;
end $$;

create or replace function public.anular_documento(p_id uuid, p_motivo text)
returns public.documentos
language plpgsql security definer set search_path = ''
as $$
declare v uuid := public._exigir_medico(); r public.documentos;
begin
  update public.documentos set estado = 'anulado', anulado_motivo = nullif(trim(p_motivo),'')
  where id = p_id and medico_id = v and estado = 'emitido'
  returning * into r;
  if r.id is null then raise exception 'Solo puedes anular tus propios documentos emitidos'; end if;
  perform public._log('anular_documento', 'documentos', r.id::text, jsonb_build_object('motivo', p_motivo));
  return r;
end $$;

create or replace function public.marcar_homologado(p_id uuid, p_homologado boolean, p_fecha date)
returns public.documentos
language plpgsql security definer set search_path = ''
as $$
declare v uuid := public._exigir_medico(); r public.documentos;
begin
  update public.documentos
     set homologado = p_homologado,
         homologado_fecha = case when p_homologado then coalesce(p_fecha, current_date) else null end
   where id = p_id and tipo in ('incapacidad','defuncion')
  returning * into r;
  if r.id is null then raise exception 'Documento no encontrado'; end if;
  perform public._log('homologar_documento', 'documentos', r.id::text, jsonb_build_object('homologado', p_homologado));
  return r;
end $$;

-- Agrega un medicamento/presentación que no está en la LOM (queda pendiente de validar)
create or replace function public.agregar_medicamento(p_generico text, p_presentacion text, p_via text)
returns public.presentaciones
language plpgsql security definer set search_path = ''
as $$
declare v uuid := public._exigir_medico(); mid uuid; r public.presentaciones;
begin
  if coalesce(length(trim(p_generico)),0) < 3 or coalesce(length(trim(p_presentacion)),0) < 2 then
    raise exception 'Escribe el nombre genérico y la presentación';
  end if;
  insert into public.medicamentos (generico, origen, validado, creado_por)
  values (trim(p_generico), 'usuario', false, v)
  on conflict (generico) do update set generico = excluded.generico
  returning id into mid;
  insert into public.presentaciones (medicamento_id, descripcion, via, origen, validado)
  values (mid, trim(p_presentacion), nullif(trim(p_via),''), 'usuario', false)
  on conflict (medicamento_id, descripcion) do update set via = coalesce(excluded.via, public.presentaciones.via)
  returning * into r;
  perform public._log('agregar_medicamento', 'presentaciones', r.id::text, jsonb_build_object('generico', p_generico, 'presentacion', p_presentacion));
  return r;
end $$;

create or replace function public.validar_presentacion(p_id uuid)
returns public.presentaciones
language plpgsql security definer set search_path = ''
as $$
declare v uuid := public._exigir_medico(); r public.presentaciones;
begin
  update public.presentaciones set validado = true where id = p_id returning * into r;
  update public.medicamentos set validado = true where id = r.medicamento_id;
  perform public._log('validar_presentacion', 'presentaciones', p_id::text, null);
  return r;
end $$;

create or replace function public.marcar_favorito(p_esquema uuid, p_favorito boolean)
returns public.esquemas
language plpgsql security definer set search_path = ''
as $$
declare v uuid := public._exigir_medico(); r public.esquemas;
begin
  update public.esquemas set favorito = p_favorito where id = p_esquema returning * into r;
  return r;
end $$;

create or replace function public.guardar_ajuste(p_clave text, p_valor jsonb)
returns public.ajustes
language plpgsql security definer set search_path = ''
as $$
declare v uuid := public._exigir_medico(); r public.ajustes;
begin
  if p_clave not in ('salud_examenes') then raise exception 'Ajuste no permitido'; end if;
  insert into public.ajustes (clave, valor, actualizado_en) values (p_clave, p_valor, now())
  on conflict (clave) do update set valor = excluded.valor, actualizado_en = now()
  returning * into r;
  perform public._log('guardar_ajuste', 'ajustes', p_clave, p_valor);
  return r;
end $$;

-- Ping para evitar que el proyecto gratuito se pause (lo llama una función programada)
create or replace function public.ping()
returns text
language sql stable security definer set search_path = ''
as $$ select 'ok'::text $$;

-- =====================================================================
-- RLS: activado en todas las tablas; solo lectura para médicos
-- =====================================================================
alter table public.medicos_permitidos enable row level security;
alter table public.medicos           enable row level security;
alter table public.pacientes         enable row level security;
alter table public.documentos        enable row level security;
alter table public.correlativos      enable row level security;
alter table public.medicamentos      enable row level security;
alter table public.presentaciones    enable row level security;
alter table public.esquemas          enable row level security;
alter table public.estudios          enable row level security;
alter table public.ajustes           enable row level security;
alter table public.bitacora          enable row level security;

create policy "medicos leen medicos"        on public.medicos        for select to authenticated using ((select public.es_medico()));
create policy "medicos leen pacientes"      on public.pacientes      for select to authenticated using ((select public.es_medico()));
create policy "medicos leen documentos"     on public.documentos     for select to authenticated using ((select public.es_medico()));
create policy "medicos leen medicamentos"   on public.medicamentos   for select to authenticated using ((select public.es_medico()));
create policy "medicos leen presentaciones" on public.presentaciones for select to authenticated using ((select public.es_medico()));
create policy "medicos leen esquemas"       on public.esquemas       for select to authenticated using ((select public.es_medico()));
create policy "medicos leen estudios"       on public.estudios       for select to authenticated using ((select public.es_medico()));
create policy "medicos leen ajustes"        on public.ajustes        for select to authenticated using ((select public.es_medico()));
create policy "cada medico lee su bitacora" on public.bitacora       for select to authenticated using (usuario_id = (select auth.uid()));
-- medicos_permitidos y correlativos: sin políticas (nadie las lee desde la API)

-- =====================================================================
-- Permisos explícitos (el proyecto no expone tablas nuevas por defecto)
-- =====================================================================
revoke all on all tables in schema public from anon, authenticated;
grant select on public.medicos, public.pacientes, public.documentos, public.medicamentos,
                public.presentaciones, public.esquemas, public.estudios, public.ajustes, public.bitacora
  to authenticated;

revoke execute on all functions in schema public from public, anon;
grant execute on function
  public.es_medico(), public.mi_cuenta(), public.actualizar_mi_perfil(jsonb),
  public.guardar_paciente(jsonb), public.emitir_documento(text, uuid, text, boolean, jsonb),
  public.anular_documento(uuid, text), public.marcar_homologado(uuid, boolean, date),
  public.agregar_medicamento(text, text, text), public.validar_presentacion(uuid),
  public.marcar_favorito(uuid, boolean), public.guardar_ajuste(text, jsonb)
  to authenticated;
grant execute on function public.ping() to anon, authenticated;
-- Funciones internas: nadie las llama desde la API
revoke execute on function public._exigir_medico(), public._log(text, text, text, jsonb),
  public._antes_de_crear_usuario(), public._despues_de_crear_usuario() from authenticated;

-- =====================================================================
-- Storage: firmas y sellos en bucket privado, cada médico en su carpeta
-- =====================================================================
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('firmas', 'firmas', false, 1048576, array['image/png','image/jpeg','image/webp'])
on conflict (id) do nothing;

create policy "medico lee su firma" on storage.objects for select to authenticated
  using (bucket_id = 'firmas' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "medico sube su firma" on storage.objects for insert to authenticated
  with check (bucket_id = 'firmas' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "medico cambia su firma" on storage.objects for update to authenticated
  using (bucket_id = 'firmas' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "medico borra su firma" on storage.objects for delete to authenticated
  using (bucket_id = 'firmas' and (storage.foldername(name))[1] = (select auth.uid())::text);
