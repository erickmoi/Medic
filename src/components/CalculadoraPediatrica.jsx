import { useEffect, useState } from 'react'
import Hoja from './Hoja.jsx'
import { supabase } from '../lib/supabase'
import { numALetras } from '../lib/util'

const f1 = (n) => Number(n).toLocaleString('es-SV', { maximumFractionDigits: 1 })
const diasDe = (txt) => { const m = String(txt || '').match(/(\d+)(?!.*\d)/); return m ? Number(m[1]) : '' }
const frecTexto = (f) => (f || '').replace(/^c\//, 'cada ').replace(' h', ' horas')

export function calcular(d, peso) {
  const mgToma = d.base === 'dosis' ? peso * d.dosis_mg_kg : (peso * d.dosis_mg_kg) / d.tomas_dia
  const mgDia = mgToma * d.tomas_dia
  const maxes = [d.max_mg_kg_dia && d.max_mg_kg_dia * peso, d.max_mg_dia].filter(Boolean)
  const max = maxes.length ? Math.min(...maxes) : null
  return { mgToma, mlToma: mgToma / d.mg_por_ml, mgDia, max, supera: max != null && mgDia > max + 0.01 }
}

// Hoja con la calculadora de dosis por peso; onAgregar(item de receta)
export default function CalculadoraPediatrica({ pesoInicial, onCerrar, onAgregar }) {
  const [lista, setLista] = useState(null)
  const [peso, setPeso] = useState(pesoInicial || '')
  const [dias, setDias] = useState({})
  useEffect(() => { supabase.from('dosis_pediatricas').select('*').order('id').then(({ data }) => setLista(data || [])) }, [])
  const p = Number(String(peso).replace(',', '.'))

  function agregar(d) {
    const c = calcular(d, p)
    const ml = Math.round(c.mlToma * 10) / 10
    const nd = Number(dias[d.id] ?? diasDe(d.duracion)) || null
    const total = nd ? Math.ceil(ml * d.tomas_dia * nd) : null
    onAgregar({
      generico: d.medicamento.replace(/ \(.*\)$/, ''),
      presentacion: d.presentacion,
      cantidad: total ? `${total} mL en total (${numALetras(total)} mililitros)` : '',
      indicacion: `Dar ${f1(ml)} mL vía oral ${frecTexto(d.frecuencia)}${nd ? ` por ${nd} ${nd === 1 ? 'día' : 'días'}` : ''} (${f1(d.dosis_mg_kg)} mg/kg/${d.base === 'dosis' ? 'dosis' : 'día'}, peso ${f1(p)} kg).`,
    })
  }

  return (
    <Hoja titulo="Dosis por peso" onCerrar={onCerrar}>
      <div className="flex flex-col gap-3">
        <div className="campo"><label htmlFor="peso">Peso del niño (kg)</label>
          <input id="peso" className="input mono text-lg" inputMode="decimal" value={peso} onChange={(e) => setPeso(e.target.value)} autoFocus={!pesoInicial} /></div>
        {!p && <p className="text-sm text-[var(--muted)] m-0">Escribe el peso para calcular.</p>}
        {!lista && [0, 1, 2].map((i) => <div key={i} className="esqueleto h-20" />)}
        {p > 0 && lista?.map((d) => {
          const c = calcular(d, p)
          return (
            <div key={d.id} className="border border-[var(--line)] rounded-2xl p-3 flex flex-col gap-1.5">
              <div className="flex justify-between gap-2"><b>{d.medicamento}</b><span className="text-xs text-[var(--muted)] text-right">{d.presentacion}</span></div>
              <div className="flex items-baseline gap-2 flex-wrap">
                <span className="mono text-2xl text-[var(--accent)]">{f1(c.mlToma)} mL</span>
                <span className="text-sm">{frecTexto(d.frecuencia)} · {f1(c.mgToma)} mg/toma · {f1(c.mgDia)} mg/día</span>
              </div>
              <span className="text-xs text-[var(--muted)]">{d.rango}</span>
              {c.supera && <span className="insignia peligro self-start">Supera el máximo ({f1(c.max)} mg/día)</span>}
              {d.observacion && <span className="insignia aviso self-start !font-normal">{d.observacion}</span>}
              <div className="flex gap-2 items-end mt-1">
                <div className="campo w-24"><label htmlFor={`d${d.id}`}>Días</label><input id={`d${d.id}`} className="input mono !min-h-10" inputMode="numeric" value={dias[d.id] ?? diasDe(d.duracion)} onChange={(e) => setDias({ ...dias, [d.id]: e.target.value })} /></div>
                <button className="btn btn-primario flex-1 !min-h-10" onClick={() => agregar(d)}>Agregar a la receta</button>
              </div>
            </div>
          )
        })}
      </div>
    </Hoja>
  )
}
