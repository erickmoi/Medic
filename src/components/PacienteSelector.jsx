import { useEffect, useState } from 'react'
import { Search, UserPlus } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { edad } from '../lib/util'
import PacienteForm from './PacienteForm.jsx'

// Tarjeta para elegir el paciente del documento (busca o crea uno nuevo)
export default function PacienteSelector({ paciente, onCambiar }) {
  const [buscando, setBuscando] = useState(!paciente)
  const [q, setQ] = useState('')
  const [lista, setLista] = useState([])
  const [nuevo, setNuevo] = useState(false)

  useEffect(() => {
    if (!buscando) return
    const t = setTimeout(async () => {
      let qry = supabase.from('pacientes').select('*').order('actualizado_en', { ascending: false }).limit(8)
      if (q.trim()) qry = qry.ilike('nombre', `%${q.trim()}%`)
      const { data } = await qry
      setLista(data || [])
    }, 200)
    return () => clearTimeout(t)
  }, [q, buscando])

  const iniciales = (n) => n.split(' ').filter(Boolean).slice(0, 2).map((x) => x[0]).join('').toUpperCase()

  return (
    <section className="tarjeta flex flex-col gap-3">
      <div className="flex justify-between items-center">
        <span className="etiqueta">Paciente</span>
        {paciente && !buscando && <button className="text-sm font-semibold text-[var(--accent)] bg-transparent border-0 cursor-pointer min-h-11" onClick={() => setBuscando(true)}>Cambiar</button>}
      </div>

      {paciente && !buscando && (
        <div className="flex items-center gap-3">
          <span className="w-11 h-11 rounded-full bg-[var(--accent-soft)] text-[var(--accent)] flex items-center justify-center font-bold">{iniciales(paciente.nombre)}</span>
          <div className="flex flex-col">
            <span className="font-semibold">{paciente.nombre}</span>
            <span className="text-[13px] text-[var(--muted)]">
              {[edad(paciente.fecha_nacimiento), paciente.sexo, paciente.peso_kg && `${paciente.peso_kg} kg`, `Alergias: ${paciente.alergias || 'ninguna conocida'}`].filter(Boolean).join(' · ')}
            </span>
          </div>
        </div>
      )}

      {buscando && (
        <>
          <label className="flex items-center gap-2 input">
            <Search size={18} color="var(--muted)" aria-hidden="true" />
            <input className="border-0 outline-0 flex-1 bg-transparent text-base" placeholder="Buscar por nombre" aria-label="Buscar paciente" value={q} onChange={(e) => setQ(e.target.value)} autoFocus />
          </label>
          <div className="flex flex-col max-h-64 overflow-auto -mx-1">
            {lista.map((p) => (
              <button key={p.id} className="fila bg-transparent border-0 text-left cursor-pointer rounded-xl hover:bg-[var(--surface-2)]" onClick={() => { onCambiar(p); setBuscando(false) }}>
                <span className="flex flex-col"><span className="font-semibold">{p.nombre}</span>
                  <span className="text-xs text-[var(--muted)]">{[edad(p.fecha_nacimiento), p.sexo, p.dui].filter(Boolean).join(' · ') || 'Sin datos extra'}</span></span>
              </button>
            ))}
            {lista.length === 0 && <p className="text-sm text-[var(--muted)] m-2">{q ? 'No se encontró. Créalo abajo.' : 'Aún no hay pacientes.'}</p>}
          </div>
          <button className="btn btn-fantasma" onClick={() => setNuevo(true)}><UserPlus size={18} aria-hidden="true" />Nuevo paciente{q && `: ${q}`}</button>
        </>
      )}
      {nuevo && <PacienteForm paciente={{ nombre: q }} onCerrar={() => setNuevo(false)} onGuardado={(p) => { setNuevo(false); onCambiar(p); setBuscando(false) }} />}
    </section>
  )
}
