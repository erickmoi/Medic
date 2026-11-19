import { useEffect, useMemo, useState } from 'react'
import { Search, Star } from 'lucide-react'
import Hoja from './Hoja.jsx'
import { supabase, rpc } from '../lib/supabase'
import { cantidadEsquema, indicacionEsquema } from '../lib/util'
import { useAviso } from './Toast.jsx'

let cache = null // catálogo en memoria durante la sesión

export async function cargarCatalogo() {
  if (cache) return cache
  const [m, p, e] = await Promise.all([
    supabase.from('medicamentos').select('*').order('generico'),
    supabase.from('presentaciones').select('*'),
    supabase.from('esquemas').select('*'),
  ])
  cache = (m.data || []).map((med) => ({
    ...med,
    presentaciones: (p.data || []).filter((x) => x.medicamento_id === med.id),
    esquemas: (e.data || []).filter((x) => x.medicamento_id === med.id),
  }))
  return cache
}
export const limpiarCatalogo = () => { cache = null }

// Hoja para agregar un medicamento a la receta. onAgregar({ generico, presentacion, cantidad, indicacion })
export default function Catalogo({ onCerrar, onAgregar, poblacionInicial = 'Adulto' }) {
  const [cat, setCat] = useState(null)
  const [q, setQ] = useState('')
  const [filtro, setFiltro] = useState('todos')
  const [pob, setPob] = useState(poblacionInicial)
  const [sel, setSel] = useState(null) // { med, pres }
  const [manual, setManual] = useState(null)
  const aviso = useAviso()

  useEffect(() => { cargarCatalogo().then(setCat) }, [])

  const lista = useMemo(() => {
    if (!cat) return []
    const t = q.trim().toLowerCase()
    return cat.filter((m) =>
      (!t || m.generico.toLowerCase().includes(t)) &&
      (filtro !== 'favoritos' || m.esquemas.some((e) => e.favorito)) &&
      (filtro !== 'validar' || !m.validado)
    ).slice(0, 40)
  }, [cat, q, filtro])

  const esquemasSel = sel ? sel.med.esquemas.filter((e) => e.presentacion_id === sel.pres.id && e.poblacion === pob) : []

  async function favorito(e) {
    const r = await rpc('marcar_favorito', { p_esquema: e.id, p_favorito: !e.favorito })
    e.favorito = r.favorito; setCat([...cat])
  }

  function elegir(esquema) {
    onAgregar({
      generico: sel.med.generico,
      presentacion: sel.pres.descripcion,
      cantidad: esquema ? cantidadEsquema(esquema) : '',
      indicacion: esquema ? indicacionEsquema(esquema) : '',
    })
  }

  async function guardarManual() {
    try {
      await rpc('agregar_medicamento', { p_generico: manual.generico, p_presentacion: manual.presentacion, p_via: manual.via || '' })
      limpiarCatalogo()
      aviso('Agregado al catálogo (pendiente de validar)')
      onAgregar({ generico: manual.generico, presentacion: manual.presentacion, cantidad: '', indicacion: '' })
    } catch (e) { aviso(e.message) }
  }

  return (
    <Hoja titulo="Agregar a la receta" onCerrar={onCerrar}>
      {!sel && !manual && (
        <div className="flex flex-col gap-3">
          <label className="flex items-center gap-2 input">
            <Search size={18} color="var(--muted)" aria-hidden="true" />
            <input className="border-0 outline-0 flex-1 bg-transparent text-base" placeholder="Buscar medicamento genérico" aria-label="Buscar medicamento" value={q} onChange={(e) => setQ(e.target.value)} autoFocus />
          </label>
          <div className="flex gap-2 flex-wrap">
            {[['todos', 'Todos'], ['favoritos', '★ Favoritos'], ['validar', 'Por validar']].map(([k, t]) =>
              <button key={k} className={`chip ${filtro === k ? 'activo' : ''}`} onClick={() => setFiltro(k)}>{t}</button>)}
          </div>
          <div className="flex flex-col gap-2">
            {!cat && [0, 1, 2].map((i) => <div key={i} className="esqueleto h-16" />)}
            {lista.map((m) => (
              <div key={m.id} className="border border-[var(--line)] rounded-2xl p-3 flex flex-col gap-2">
                <div className="flex justify-between items-center gap-2">
                  <span className="font-bold">{m.generico}</span>
                  {m.origen === 'usuario' && !m.validado ? <span className="insignia aviso">Por validar</span> : m.atc && <span className="mono text-xs text-[var(--muted)]">{m.atc}</span>}
                </div>
                <div className="flex gap-2 flex-wrap">
                  {m.presentaciones.map((p) => <button key={p.id} className="btn !min-h-9 !text-[13px] !font-medium !rounded-xl" onClick={() => setSel({ med: m, pres: p })}>{p.descripcion}</button>)}
                </div>
              </div>
            ))}
            {cat && lista.length === 0 && <p className="text-sm text-[var(--muted)]">No está en el catálogo.</p>}
          </div>
          <button className="btn btn-fantasma" onClick={() => setManual({ generico: q, presentacion: '', via: 'VO' })}>+ Escribir uno que no está en la lista</button>
        </div>
      )}

      {sel && (
        <div className="flex flex-col gap-3 entrar">
          <button className="text-sm text-[var(--accent)] bg-transparent border-0 cursor-pointer self-start min-h-11" onClick={() => setSel(null)}>← Volver</button>
          <div><div className="font-bold text-lg">{sel.med.generico}</div><div className="text-sm text-[var(--muted)]">{sel.pres.descripcion}</div></div>
          <div className="segmentado">{['Adulto', 'Niño'].map((p) => <button key={p} className={pob === p ? 'activo' : ''} onClick={() => setPob(p)}>{p}</button>)}</div>
          <span className="etiqueta">Esquemas guardados</span>
          {esquemasSel.length === 0 && <p className="text-sm text-[var(--muted)] m-0">No hay esquema para {pob.toLowerCase()} con esta presentación. Agrégalo y escribe la indicación.</p>}
          {esquemasSel.map((e) => (
            <div key={e.id} className="border border-[var(--line)] rounded-2xl p-3 flex flex-col gap-1">
              <div className="flex justify-between gap-2">
                <span className="text-xs text-[var(--muted)]">{[e.diagnostico, e.linea && e.linea !== '—' && `Línea: ${e.linea}`].filter(Boolean).join(' · ')}</span>
                <button className="bg-transparent border-0 cursor-pointer p-1" aria-label={e.favorito ? 'Quitar de favoritos' : 'Marcar favorito'} onClick={() => favorito(e)}>
                  <Star size={18} fill={e.favorito ? '#B7791F' : 'none'} color={e.favorito ? '#B7791F' : 'var(--muted)'} />
                </button>
              </div>
              <span className="text-[15px]">{indicacionEsquema(e)} <b>{cantidadEsquema(e)}</b></span>
              {e.condicion && <span className="text-xs text-[var(--muted)]">{e.condicion}</span>}
              {e.observacion && /REVISAR|Tu hoja/.test(e.observacion) && <span className="insignia aviso self-start !font-normal">{e.observacion}</span>}
              <button className="btn btn-primario mt-2" onClick={() => elegir(e)}>Usar este esquema</button>
            </div>
          ))}
          <button className="btn" onClick={() => elegir(null)}>Agregar sin esquema</button>
        </div>
      )}

      {manual && (
        <div className="flex flex-col gap-3 entrar">
          <button className="text-sm text-[var(--accent)] bg-transparent border-0 cursor-pointer self-start min-h-11" onClick={() => setManual(null)}>← Volver</button>
          <div className="campo"><label htmlFor="mg">Nombre genérico</label><input id="mg" className="input" value={manual.generico} onChange={(e) => setManual({ ...manual, generico: e.target.value })} /></div>
          <div className="campo"><label htmlFor="mp">Presentación (concentración y forma)</label><input id="mp" className="input" placeholder="Ej.: 15 mg/5 mL jarabe" value={manual.presentacion} onChange={(e) => setManual({ ...manual, presentacion: e.target.value })} /></div>
          <div className="campo"><label htmlFor="mv">Vía</label><input id="mv" className="input" value={manual.via} onChange={(e) => setManual({ ...manual, via: e.target.value })} /></div>
          <p className="text-xs text-[var(--muted)] m-0">Quedará en el catálogo como "Por validar" hasta que tú o Sara lo validen.</p>
          <button className="btn btn-primario" disabled={manual.generico.trim().length < 3 || manual.presentacion.trim().length < 2} onClick={guardarManual}>Guardar y agregar</button>
        </div>
      )}
    </Hoja>
  )
}
