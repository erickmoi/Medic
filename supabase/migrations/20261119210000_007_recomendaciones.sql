-- 007 · Recomendaciones por defecto para medicamentos y preparación de estudios.
-- Se agregan solas al documento; el médico las puede borrar o cambiar antes de emitir.

alter table public.medicamentos add column recomendacion text;

update public.medicamentos m set recomendacion = v.r from (values
  ('Amoxicilina', 'Completar el antibiótico aunque los síntomas mejoren.'),
  ('Amoxicilina + ácido clavulánico', 'Tomar al inicio de las comidas. Completar el antibiótico aunque los síntomas mejoren.'),
  ('Claritromicina', 'Completar el antibiótico aunque los síntomas mejoren.'),
  ('Doxiciclina', 'Tomar con abundante agua y no acostarse en los 30 minutos siguientes. Evitar exposición prolongada al sol. Completar el antibiótico.'),
  ('Levofloxacina', 'No tomar junto con antiácidos, hierro, calcio o lácteos (separar 2 horas). Completar el antibiótico.'),
  ('Ciprofloxacina', 'No tomar junto con antiácidos, hierro, calcio o lácteos (separar 2 horas). Completar el antibiótico.'),
  ('Trimetoprim + sulfametoxazol', 'Tomar con abundantes líquidos. Completar el antibiótico.'),
  ('Nitrofurantoína (macrocristales)', 'Tomar con alimentos. La orina puede tomar un color más oscuro. Completar el antibiótico.'),
  ('Metronidazol', 'No consumir bebidas alcohólicas durante el tratamiento y hasta 72 horas después.'),
  ('Penicilina G benzatínica', 'Permanecer 30 minutos en observación después de la inyección.'),
  ('Ibuprofeno', 'Tomar con alimentos.'),
  ('Diclofenaco sódico', 'Tomar con alimentos.'),
  ('Indometacina', 'Tomar con alimentos.'),
  ('Acetaminofén', 'No exceder 4 gramos al día ni combinar con otros productos que contengan acetaminofén.'),
  ('Clorfeniramina maleato', 'Puede causar somnolencia: evitar conducir y el alcohol.'),
  ('Dimenhidrinato', 'Puede causar somnolencia: evitar conducir y el alcohol.'),
  ('Omeprazol', 'Tomar en ayunas, 30 minutos antes del desayuno.'),
  ('Sucralfato', 'Tomar con el estómago vacío, 1 hora antes de las comidas.'),
  ('Metoclopramida', 'Puede causar somnolencia o movimientos involuntarios: suspender y consultar si aparecen.'),
  ('Fenazopiridina', 'Tiñe la orina de color naranja; es normal.'),
  ('Albendazol', 'Tomar con alimentos.'),
  ('Prednisona', 'Tomar por la mañana con alimentos.'),
  ('Sales de rehidratación oral', 'Disolver en 1 litro de agua segura y desechar lo preparado después de 24 horas.'),
  ('Psyllium (ispaghula)', 'Tomar con un vaso grande de agua.'),
  ('Ergotamina + cafeína', 'No exceder la dosis indicada. No usar en embarazo.'),
  ('Propranolol', 'No suspender de forma brusca.'),
  ('Amitriptilina', 'Tomar por la noche; puede causar somnolencia.'),
  ('Ácido valproico', 'No suspender de forma brusca. Evitar el alcohol.'),
  ('Metocarbamol', 'Puede causar somnolencia: evitar conducir y el alcohol.'),
  ('Orfenadrina citrato', 'Puede causar somnolencia: evitar conducir y el alcohol.'),
  ('Clotrimazol', 'Aplicar por la noche al acostarse. Evitar relaciones sexuales durante el tratamiento.'),
  ('Clindamicina fosfato', 'Aplicar por la noche al acostarse. Evitar relaciones sexuales durante el tratamiento.'),
  ('Cloranfenicol', 'Lavarse las manos antes de aplicar y no tocar el ojo con el gotero.'),
  ('Tobramicina', 'Lavarse las manos antes de aplicar y no tocar el ojo con el gotero.')
) as v(g, r) where m.generico = v.g;

update public.estudios e set preparacion = v.p from (values
  ('Examen general de heces', 'Recolectar la muestra en frasco limpio y entregarla en menos de 2 horas'),
  ('Coprocultivo', 'Recolectar la muestra en frasco estéril antes de iniciar antibióticos'),
  ('Azul de metileno en heces', 'Recolectar la muestra en frasco limpio y entregarla en menos de 2 horas'),
  ('Transaminasas (TGO/TGP)', 'Ayuno de 8 horas'),
  ('Ácido úrico', 'Ayuno de 8 horas'),
  ('Hierro sérico', 'Ayuno de 8 horas'),
  ('Mamografía', 'No aplicar desodorante, talco ni crema en axilas y mamas el día del estudio'),
  ('Espirometría', 'No fumar ni hacer ejercicio intenso 1 hora antes'),
  ('TAC de abdomen con contraste', 'Ayuno de 6 horas; llevar resultado reciente de creatinina'),
  ('Rayos X de abdomen de pie y acostado', 'Ayuno de 6 horas'),
  ('Prueba de embarazo en sangre (β-hCG)', 'No requiere ayuno')
) as v(n, p) where e.nombre = v.n and e.preparacion is null;
