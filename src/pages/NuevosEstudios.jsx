import { useEffect, useMemo, useState } from 'react'
import { Search, X } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { hoyISO } from '../lib/util'
import { useAjustes } from '../lib/ajustes'
import PacienteSelector from '../components/PacienteSelector.jsx'
import Diagnostico from '../components/Diagnostico.jsx'
import CabeceraForm from '../components/CabeceraForm.jsx'
import { useOpciones, useBorrador, fotoPaciente, OpcionesEmision, BotonEmitir } from '../components/Emision.jsx'

const INICIAL = { paciente: null, dx: null, estudios: [], indicaciones: 'Traer resultados a la consulta.' }
const linea = (p) => (p.endsWith('.') ? p : p + '.')

export default function NuevosEstudios() {
  const [b, setB, limpiar] = useBorrador('estudios', INICIAL)
  const [op, setOp] = useOpciones('estudios', 'media_carta')
  const ajustes = useAjustes()
  const [cat, setCat] = useState([])
  const [tipo, setTipo] = useState('laboratorio')
  const [q, setQ] = useState('')

  useEffect(() => { supabase.from('estudios').select('*').eq('activo', true).order('grupo').order('nombre').then(({ data }) => setCat(data || [])) }, [])

  const elegidos = new Set(b.estudios.map((e) => e.nombre))
  const filtrados = useMemo(() => cat.filter((e) => e.tipo === tipo && (!q.trim() || e.nombre.toLowerCase().includes(q.trim().toLowerCase()))), [cat, tipo, q])
  const grupos = [...new Set(filtrados.map((e) => e.grupo))]

  // La preparación de cada estudio se agrega sola a las indicaciones (se puede borrar)
  function alternar(e) {
    const ya = elegidos.has(e.nombre)
    const estudios = ya ? b.estudios.filter((x) => x.nombre !== e.nombre) : [...b.estudios, { nombre: e.nombre, tipo: e.tipo, preparacion: e.preparacion }]
    let ind = b.indicaciones || ''
    if (e.preparacion) {
      const l = linea(e.preparacion)
      if (!ya && !ind.includes(l)) ind = [ind.trim(), l].filter(Boolean).join('\n')
      if (ya && !estudios.some((x) => x.preparacion === e.preparacion)) ind = ind.split('\n').filter((x) => x.trim() !== l).join('\n')
    }
    setB({ ...b, estudios, indicaciones: ind })
  }
  const agregarLibre = () => {
    if (q.trim().length < 3 || elegidos.has(q.trim())) return
    setB({ ...b, estudios: [...b.estudios, { nombre: q.trim(), tipo }] }); setQ('')
  }
  const indicaciones = (b.indicaciones || '').trim()

  const contenido = { fecha: hoyISO(), paciente: fotoPaciente(b.paciente), dx: b.dx, codigo_modo: ajustes.codigo_diagnostico, estudios: b.estudios.map(({ nombre, tipo }) => ({ nombre, tipo })), indicaciones }
  const valido = b.paciente && b.estudios.length > 0

  return (
    <div className="flex flex-col gap-4 entrar pb-6">
      <CabeceraForm titulo="Solicitud de estudios" mostrarLimpiar={b.paciente || b.estudios.length} onLimpiar={limpiar} />
      <PacienteSelector paciente={b.paciente} onCambiar={(p) => setB({ ...b, paciente: p })} />

      <section className="tarjeta flex flex-col gap-3">
        <div className="flex justify-between items-center"><span className="etiqueta">Estudios indicados</span><span className="insignia">{b.estudios.length}</span></div>
        {b.estudios.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {b.estudios.map((e) => <button key={e.nombre} className="chip activo" onClick={() => alternar(e)} aria-label={`Quitar ${e.nombre}`}>{e.nombre} <X size={13} aria-hidden="true" /></button>)}
          </div>
        )}
        <div className="segmentado">
          <button className={tipo === 'laboratorio' ? 'activo' : ''} onClick={() => setTipo('laboratorio')}>Laboratorio</button>
          <button className={tipo === 'gabinete' ? 'activo' : ''} onClick={() => setTipo('gabinete')}>Gabinete</button>
        </div>
        <label className="flex items-center gap-2 input">
          <Search size={18} color="var(--muted)" aria-hidden="true" />
          <input className="border-0 outline-0 flex-1 bg-transparent text-base min-w-0" placeholder="Buscar estudio" aria-label="Buscar estudio" value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && agregarLibre()} />
        </label>
        <div className="flex flex-col gap-3 max-h-[46dvh] overflow-auto">
          {grupos.map((g) => (
            <div key={g} className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold text-[var(--muted)]">{g}</span>
              <div className="flex flex-wrap gap-2">
                {filtrados.filter((e) => e.grupo === g).map((e) => <button key={e.id} className={`chip ${elegidos.has(e.nombre) ? 'activo' : ''}`} aria-pressed={elegidos.has(e.nombre)} onClick={() => alternar(e)}>{e.nombre}</button>)}
              </div>
            </div>
          ))}
          {q.trim().length > 2 && filtrados.length === 0 && <button className="btn btn-fantasma" onClick={agregarLibre}>+ Agregar "{q.trim()}"</button>}
        </div>
      </section>

      <section className="tarjeta"><Diagnostico value={b.dx} onChange={(dx) => setB((x) => ({ ...x, dx }))} etiqueta="Impresión diagnóstica" /></section>

      <section className="tarjeta campo">
        <label htmlFor="ind">Indicaciones</label>
        <textarea id="ind" className="input !min-h-[110px]" placeholder="Traer resultados a la consulta." value={b.indicaciones} onChange={(e) => setB({ ...b, indicaciones: e.target.value })} />
        <span className="text-xs text-[var(--muted)]">La preparación de cada estudio se agrega sola; bórrala si no la quieres.</span>
      </section>

      <OpcionesEmision op={op} setOp={setOp} />
      <BotonEmitir tipo="estudios" paciente={b.paciente} op={op} contenido={contenido} valido={valido} onEmitido={limpiar} />
      {!valido && <p className="text-xs text-[var(--muted)] text-center m-0">Falta {!b.paciente ? 'elegir el paciente' : 'marcar al menos un estudio'}.</p>}
    </div>
  )
}
