import { useEffect, useRef, useState } from 'react'
import { Search, X } from 'lucide-react'
import { supabase, rpc } from '../lib/supabase'
import { useAviso } from './Toast.jsx'

// Buscador de diagnóstico con CIE-10 y CIE-11. value = { nombre, cie10, cie11 } | null
export default function Diagnostico({ value, onChange, etiqueta = 'Diagnóstico', id = 'dx' }) {
  const [q, setQ] = useState(value?.nombre || '')
  const [lista, setLista] = useState([])
  const [abierto, setAbierto] = useState(false)
  const aviso = useAviso()
  const caja = useRef(null)

  useEffect(() => { setQ(value?.nombre || '') }, [value?.nombre])
  useEffect(() => {
    if (!abierto) return
    const t = setTimeout(async () => {
      const term = q.trim()
      let qry = supabase.from('diagnosticos').select('*').order('frecuente', { ascending: false }).order('nombre').limit(12)
      if (term) qry = qry.or(`nombre.ilike.%${term.replace(/[,()]/g, ' ')}%,cie10.ilike.${term.replace(/[,()]/g, '')}%,cie11.ilike.${term.replace(/[,()]/g, '')}%`)
      const { data } = await qry
      setLista(data || [])
    }, 180)
    return () => clearTimeout(t)
  }, [q, abierto])
  useEffect(() => {
    const fuera = (e) => caja.current && !caja.current.contains(e.target) && setAbierto(false)
    document.addEventListener('pointerdown', fuera)
    return () => document.removeEventListener('pointerdown', fuera)
  }, [])

  const elegir = (d) => { onChange({ nombre: d.nombre, cie10: d.cie10 || '', cie11: d.cie11 || '' }); setQ(d.nombre); setAbierto(false) }
  const escribir = (t) => { setQ(t); setAbierto(true); onChange(t.trim() ? { nombre: t, cie10: value?.cie10 || '', cie11: value?.cie11 || '' } : null) }
  const setCod = (k) => (e) => onChange({ ...(value || { nombre: q }), [k]: e.target.value.toUpperCase() })

  async function guardarEnCatalogo() {
    try { await rpc('agregar_diagnostico', { p_nombre: value.nombre, p_cie10: value.cie10 || '', p_cie11: value.cie11 || '' }); aviso('Diagnóstico guardado en el catálogo') }
    catch (e) { aviso(e.message) }
  }
  const enCatalogo = lista.some((d) => d.nombre.toLowerCase() === (value?.nombre || '').trim().toLowerCase())

  return (
    <div className="flex flex-col gap-2" ref={caja}>
      <div className="campo relative">
        <label htmlFor={id}>{etiqueta}</label>
        <div className="flex items-center gap-2 input">
          <Search size={18} color="var(--muted)" aria-hidden="true" />
          <input id={id} className="border-0 outline-0 flex-1 bg-transparent text-base min-w-0" placeholder="Buscar por nombre o código" autoComplete="off"
            value={q} onChange={(e) => escribir(e.target.value)} onFocus={() => setAbierto(true)} role="combobox" aria-expanded={abierto} aria-controls={`${id}-lista`} />
          {q && <button type="button" className="bg-transparent border-0 cursor-pointer p-1" aria-label="Borrar diagnóstico" onClick={() => escribir('')}><X size={16} /></button>}
        </div>
        {abierto && lista.length > 0 && (
          <ul id={`${id}-lista`} role="listbox" className="entrar absolute z-20 top-full mt-1 left-0 right-0 m-0 p-1 list-none bg-[var(--surface)] border border-[var(--line)] rounded-2xl shadow-lg max-h-72 overflow-auto">
            {lista.map((d) => (
              <li key={d.id}>
                <button type="button" role="option" aria-selected="false" className="w-full text-left bg-transparent border-0 cursor-pointer rounded-xl px-3 py-2.5 hover:bg-[var(--surface-2)] flex flex-col gap-0.5" onClick={() => elegir(d)}>
                  <span className="text-[15px] text-[var(--text)]">{d.nombre}</span>
                  <span className="mono text-xs text-[var(--muted)]">{[d.cie10 && `CIE-10 ${d.cie10}`, d.cie11 && `CIE-11 ${d.cie11}`].filter(Boolean).join(' · ')}{!d.validado ? (d.origen === 'usuario' ? ' · por validar' : ' · CIE-11 aproximado, revisar') : ''}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      {value?.nombre && (
        <div className="grid grid-cols-2 gap-2">
          <div className="campo"><label htmlFor={`${id}-10`}>CIE-10</label><input id={`${id}-10`} className="input mono" value={value.cie10 || ''} onChange={setCod('cie10')} /></div>
          <div className="campo"><label htmlFor={`${id}-11`}>CIE-11</label><input id={`${id}-11`} className="input mono" value={value.cie11 || ''} onChange={setCod('cie11')} /></div>
          {!enCatalogo && (value.cie10 || value.cie11) && <button type="button" className="btn btn-fantasma col-span-2 !min-h-10 text-sm" onClick={guardarEnCatalogo}>Guardar este diagnóstico en el catálogo</button>}
        </div>
      )}
    </div>
  )
}
