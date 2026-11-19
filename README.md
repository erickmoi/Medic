# Medic

App web (PWA) de formatos médicos para el Dr. Erick Moisés Díaz Chica (J.V.P.M. 24508) y la Dra. Sara Raquel Campos Sánchez (J.V.P.M. 24509): recetas, constancias de incapacidad y, en próximas fases, solicitud de estudios, certificado de salud, constancia y defunción.

## Stack
- React + Vite + Tailwind 4, PWA (`vite-plugin-pwa`).
- Supabase (proyecto **Medic**): Postgres + Auth + Storage privado `firmas`.
- PDF en el navegador con `html2pdf.js`; impresión con `@page` a tamaño carta o media carta.
- Netlify para publicar (pendiente).

## Seguridad
- Solo los correos de `medicos_permitidos` pueden crear cuenta (trigger en `auth.users`).
- RLS en todas las tablas; desde la app solo se **lee**. Toda escritura pasa por funciones RPC `security definer` que validan que quien llama es médico.
- Las tablas nuevas no se exponen a la API hasta darles `grant` explícito en una migración.
- Firma y sello en bucket privado; cada médico solo ve su carpeta.

## Estructura
```
supabase/migrations/   001 esquema, RLS y RPC · 002 catálogos iniciales (GPC + LOM SRS 2025)
src/lib/               cliente Supabase, sesión, utilidades (fechas y números en letras)
src/components/        hojas, avisos, catálogo de medicamentos, pacientes, emisión
src/docs/              diseño de cada documento imprimible
src/pages/             Inicio, Pacientes, Historial, Mi perfil, Nueva receta, Incapacidad, Documento
tools/muestra.html     vista previa local con datos de ejemplo (no se publica)
```

## Probar en local
```bash
cp .env.example .env   # poner la clave publicable de Supabase
npm install
npm run dev            # app
# vista previa con datos de ejemplo: http://localhost:5173/tools/muestra.html?v=receta-doc
```

## Fuentes de datos
- Presentaciones y códigos ATC: Superintendencia de Regulación Sanitaria, *Listado oficial de medicamentos 2025*.
- Esquemas: hoja TRATAMIENTOS_SEGUN_GPC de los médicos, revisada (observaciones en la tabla `esquemas`).
