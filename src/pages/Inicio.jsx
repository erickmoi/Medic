import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { CalendarDays, FlaskConical, HeartPulse, FileText, Cross } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/auth.jsx'
import { fechaHumana, TIPOS } from '../lib/util'
import Hoja from '../components/Hoja.jsx'

const VERSION = '0.3.0'
const NOVEDADES = ['Solicitud de estudios, certificado de salud, constancia y defunción', 'Buscador de diagnósticos con CIE-10 y CIE-11 (elige cuál mostrar en Mi perfil)', 'Calculadora de dosis por peso en la receta', 'Exportar a Word y repetir un documento con los mismos datos', 'Resumen del mes en Historial, catálogo por validar y respaldo en Mi perfil']

const DOCS = [
  { tipo: 'receta', ruta: '/nuevo/receta', icono: null },
  { tipo: 'incapacidad', ruta: '/nuevo/incapacidad', icono: CalendarDays },
  { tipo: 'estudios', ruta: '/nuevo/estudios', icono: FlaskConical },
  { tipo: 'salud', ruta: '/nuevo/salud', icono: HeartPulse },
  { tipo: 'constancia', ruta: '/nuevo/constancia', icono: FileText },
  { tipo: 'defuncion', ruta: '/nuevo/defuncion', icono: Cross },
]

function saludo() {
  const h = Number(new Date().toLocaleString('en-US', { timeZone: 'America/El_Salvador', hour: 'numeric', hour12: false }))
  return h < 12 ? 'Buenos días' : h < 19 ? 'Buenas tardes' : 'Buenas noches'
}

export default function Inicio() {
  const { cuenta } = useAuth()
  const [recientes, setRecientes] = useState(null)
  const [novedades, setNovedades] = useState(() => localStorage.getItem('medic-version-vista') !== VERSION)
  const cerrarNovedades = () => { localStorage.setItem('medic-version-vista', VERSION); setNovedades(false) }

  useEffect(() => {
    supabase.from('documentos').select('id, codigo, tipo, estado, emitido_en, tamano, homologado, nombre:contenido->paciente->>nombre, fallecido:contenido->fallecido->>nombre, medico_id')
      .order('emitido_en', { ascending: false }).limit(6)
      .then(({ data }) => setRecientes(data || []))
  }, [])

  const nombreCorto = cuenta.nombre.split(' ')[0]
  return (
    <div className="flex flex-col gap-6 entrar">
      <header className="flex flex-col gap-1">
        <span className="text-sm text-[var(--muted)] capitalize">{new Date().toLocaleDateString('es-SV', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'America/El_Salvador' })}</span>
        <h1 className="titulo">{saludo()}, {cuenta.titulo === 'Dra.' ? 'Dra.' : 'Dr.'} {nombreCorto}</h1>
      </header>

      <section className="flex flex-col gap-3">
        <span className="etiqueta">Nuevo documento</span>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {DOCS.map(({ tipo, ruta, icono: Icono }) => {
            const contenido = (
              <>
                {Icono ? <Icono size={26} color="var(--accent)" aria-hidden="true" /> : <span className="serif text-[30px] leading-none text-[var(--accent)]">℞</span>}
                <span className="font-semibold">{TIPOS[tipo].nombre}</span>
                {!ruta && <span className="insignia aviso self-start">Próximamente</span>}
              </>
            )
            return ruta
              ? <Link key={tipo} to={ruta} className="tarjeta btn-tarjeta flex flex-col gap-3 no-underline text-inherit min-h-[96px] transition-transform active:scale-[.97]">{contenido}</Link>
              : <div key={tipo} className="tarjeta flex flex-col gap-3 min-h-[96px] opacity-60" aria-disabled="true">{contenido}</div>
          })}
        </div>
      </section>

      {novedades && (
        <Hoja titulo={`Novedades · v${VERSION}`} onCerrar={cerrarNovedades} pie={<button className="btn btn-primario w-full" onClick={cerrarNovedades}>Entendido</button>}>
          <ul className="m-0 pl-5 flex flex-col gap-2 text-[15px] list-disc">{NOVEDADES.map((n) => <li key={n}>{n}</li>)}</ul>
        </Hoja>
      )}

      <section className="flex flex-col gap-3">
        <div className="flex justify-between items-baseline">
          <span className="etiqueta">Recientes</span>
          <Link to="/historial" className="text-sm text-[var(--accent)] no-underline">Ver historial</Link>
        </div>
        <div className="tarjeta !p-0 overflow-hidden">
          {recientes === null && [0, 1, 2].map((i) => <div key={i} className="esqueleto h-12 m-3" />)}
          {recientes?.length === 0 && <p className="p-4 m-0 text-sm text-[var(--muted)]">Aún no hay documentos. Empieza con una receta.</p>}
          {recientes?.map((d) => (
            <Link key={d.id} to={`/documento/${d.id}`} className="fila">
              <span className="mono text-xs text-[var(--accent)] w-16">{d.codigo}</span>
              <div className="flex flex-col flex-1 min-w-0">
                <span className="font-semibold text-[15px] truncate">{TIPOS[d.tipo].nombre} · {d.nombre || d.fallecido || 'Sin paciente'}</span>
                <span className="text-xs text-[var(--muted)]">{fechaHumana(d.emitido_en)}{d.medico_id !== cuenta.id ? ' · otro médico' : ''}</span>
              </div>
              {d.estado === 'anulado' && <span className="insignia peligro">Anulado</span>}
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
