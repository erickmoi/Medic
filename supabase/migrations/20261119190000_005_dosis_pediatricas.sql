-- 005 · Dosis pediátricas por peso (hoja de dosificación de los médicos, revisada) y validación de diagnósticos

create table public.dosis_pediatricas (
  id integer primary key, medicamento text not null, presentacion text not null,
  mg_por_ml numeric not null check (mg_por_ml > 0), dosis_mg_kg numeric not null,
  base text not null check (base in ('dosis','dia')), tomas_dia numeric not null check (tomas_dia > 0),
  frecuencia text, duracion text, max_mg_kg_dia numeric, max_mg_dia numeric, rango text, observacion text
);
alter table public.dosis_pediatricas enable row level security;
create policy "medicos leen dosis pediatricas" on public.dosis_pediatricas for select to authenticated using ((select public.es_medico()));
grant select on public.dosis_pediatricas to authenticated;

insert into public.dosis_pediatricas (id, medicamento, presentacion, mg_por_ml, dosis_mg_kg, base, tomas_dia, frecuencia, duracion, max_mg_kg_dia, max_mg_dia, rango, observacion) values
(1,'Acetaminofén','120 mg/5 mL jarabe',24,15,'dosis',4,'c/6 h','5 días',75,null,'10-15 mg/kg/dosis c/4-6 h; máx 75 mg/kg/día',null),
(2,'Ibuprofeno','100 mg/5 mL suspensión',20,10,'dosis',3,'c/8 h','5 días',40,1600,'5-10 mg/kg/dosis c/6-8 h; máx 40 mg/kg/día (<40 kg) o 1600 mg (>40 kg)',null),
(3,'Amoxicilina','250 mg/5 mL suspensión',50,50,'dia',3,'c/8 h','7-10 días',90,3000,'25-50 mg/kg/día en 2-3 tomas; dosis alta 90 mg/kg/día; máx 2-3 g/día','Tu hoja dice a la vez "máx. 500 c/12 h" y "máx. 2-3 g/24 h": unificar. Se puso 3000 mg/día.'),
(4,'Amoxicilina + ácido clavulánico','250/62.5 mg/5 mL suspensión',50,50,'dia',3,'c/8 h',null,90,null,'40-60 mg/kg/día; dosis alta 90 mg/kg/día','Tu hoja no dice en cuántas tomas (se puso 3). Dice "máx. 875 mg/día", que probablemente es por toma: confirmar y llenar el máximo.'),
(5,'Claritromicina','250 mg/5 mL suspensión',50,15,'dia',2,'c/12 h','10 días',null,null,'15 mg/kg/día en 2 tomas','Sin máximo en tu hoja.'),
(6,'Trimetoprim + sulfametoxazol (dosis por TMP)','40/200 mg/5 mL suspensión',8,10,'dia',2,'c/12 h','7 días',null,320,'8-12 mg/kg/día en 2 tomas; evitar en <2 meses','Tu hoja dice máx. 160 mg/día; lo habitual es 160 mg por toma (320 mg/día de TMP). Confirmar.'),
(7,'Cefadroxilo','250 mg/5 mL suspensión',50,30,'dia',2,'c/12 h',null,null,null,'30 mg/kg/día en 2 tomas',null),
(8,'Metronidazol (giardiasis)','250 mg/5 mL suspensión',50,15,'dia',3,'c/8 h','5-7 días',null,null,'15-30 mg/kg/día c/8 h','En DOSIFICACION dice 30-50 mg/kg/día y en NIÑOS!E2 20 mg/kg c/8 h: unificar.'),
(9,'Metronidazol (amebiasis)','250 mg/5 mL suspensión',50,35,'dia',3,'c/8 h','10 días',null,null,'35-50 mg/kg/día c/8 h',null),
(10,'Diloxanida furoato','200 mg/5 mL suspensión',40,20,'dia',3,'c/8 h','10 días',null,null,'NIÑOS: 20 mg/kg c/8 h · DOSIFICACION: 30-50 mg/kg/dosis','Las dos hojas no coinciden. Se puso 20 mg/kg/día en 3 tomas: confirmar.'),
(11,'Aciclovir','200 mg/5 mL suspensión',40,20,'dosis',4,'c/6 h',null,null,null,'20 mg/kg/dosis c/6 h','Sin máximo por toma en tu hoja.'),
(12,'Prednisona / prednisolona','15 mg/5 mL jarabe',3,1,'dia',1,'c/24 h',null,null,null,'0.5-2 mg/kg/día','Excel convirtió la presentación "15/5" en fecha. La LOM solo trae prednisona en tabletas (5, 20 y 50 mg).'),
(13,'Clorfeniramina maleato','2 mg/5 mL jarabe',0.4,0.35,'dia',3,'c/8 h',null,null,null,'0.35 mg/kg/día en 3 tomas (alternativa 0.1 mg/kg/dosis); mayores de 2 años','Excel convirtió "2/5" en fecha.'),
(14,'Ambroxol','15 mg/5 mL jarabe',3,1.5,'dia',2,'c/12 h',null,null,null,'1-1.5 mg/kg/día','Excel convirtió "15/5" en fecha. En tu calculadora los valores de prueba (50 kg, 33) no cuadran con el rango.'),
(15,'Loratadina','5 mg/5 mL jarabe (1 mg/mL)',1,0.25,'dia',1,'c/24 h','5 días',null,null,'0.25 mg/kg/día · NIÑOS: 5 mL al día en mayores de 2 años','Excel convirtió "5/5" en fecha.'),
(16,'Dimenhidrinato','15 mg/5 mL jarabe',3,5,'dia',3,'c/8 h',null,null,null,'5 mg/kg/día en 3 tomas','Tu hoja dice "15/25": confirmar la presentación. La LOM solo trae 50 mg tableta y 50 mg/mL inyectable.');

create or replace function public.validar_diagnostico(p_id uuid)
returns public.diagnosticos
language plpgsql security definer set search_path = '' as $$
declare v uuid := public._exigir_medico(); r public.diagnosticos;
begin
  update public.diagnosticos set validado = true where id = p_id returning * into r;
  if r.id is null then raise exception 'Diagnóstico no encontrado'; end if;
  perform public._log('validar_diagnostico', 'diagnosticos', p_id::text, null);
  return r;
end $$;
revoke execute on function public.validar_diagnostico(uuid) from public, anon;
grant execute on function public.validar_diagnostico(uuid) to authenticated;
