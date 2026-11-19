import { useEffect, useState } from 'react'
import { Search, UserPlus } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { edad, fechaHumana, TIPOS } from '../lib/util'
import PacienteForm from '../components/PacienteForm.jsx'
import { Link } from 'react-router-dom'

export default function Pacientes() {
  const [q, setQ] = useState('')
  const [lista, setLista] = useState(null)
  const [editando, setEditando] = useState(null)
  const [abierto, setAbierto] = useState(null)
  const [docs, setDocs] = useState([])

  async function cargar() {
    let qry = supabase.from('pacientes').select('*').order('nombre')
    if (q.trim()) qry = qry.ilike('nombre', `%${q.trim()}%`)
    const { data } = await qry.limit(200)
    setLista(data || [])
  }
  useEffect(() => { const t = setTimeout(cargar, 200); return () => clearTimeout(t) }, [q])

  async function abrir(p) {
    setAbierto(abierto === p.id ? null : p.id)
    const { data } = await supabase.from('documentos').select('id,codigo,tipo,estado,emitido_en').eq('paciente_id', p.id).order('emitido_en', { ascending: false })
    setDocs(data || [])
  }

  return (
    <div className="flex flex-col gap-4 entrar">
      <div className="flex justify-between items-center gap-3">
        <h1 className="titulo">Pacientes</h1>
        <button className="btn btn-primario" onClick={() => setEditando({})}><UserPlus size={18} aria-hidden="true" />Nuevo</button>
      </div>
      <label className="flex items-center gap-2 input">
        <Search size={18} color="var(--muted)" aria-hidden="true" />
        <input className="border-0 outline-0 flex-1 bg-transparent text-base" placeholder="Buscar por nombre" aria-label="Buscar paciente" value={q} onChange={(e) => setQ(e.target.value)} />
      </label>
      <div className="tarjeta !p-0 overflow-hidden">
        {lista === null && [0, 1, 2].map((i) => <div key={i} className="esqueleto h-12 m-3" />)}
        {lista?.length === 0 && <p className="p-4 m-0 text-sm text-[var(--muted)]">{q ? 'Sin resultados.' : 'Aún no hay pacientes. Se agregan también al hacer un documento.'}</p>}
        {lista?.map((p) => (
          <div key={p.id} className="border-b border-[var(--line)] last:border-0">
            <button className="fila w-full bg-transparent border-0 text-left cursor-pointer !border-0" onClick={() => abrir(p)} aria-expanded={abierto === p.id}>
              <div className="flex flex-col flex-1">
                <span className="font-semibold">{p.nombre}</span>
                <span className="text-xs text-[var(--muted)]">{[edad(p.fecha_nacimiento), p.sexo, p.dui, p.telefono].filter(Boolean).join(' · ') || 'Sin datos extra'}</span>
              </div>
            </button>
            {abierto === p.id && (
              <div className="px-4 pb-4 flex flex-col gap-2 entrar">
                {docs.length === 0 && <span className="text-sm text-[var(--muted)]">Sin documentos.</span>}
                {docs.map((d) => (
                  <Link key={d.id} to={`/documento/${d.id}`} className="text-sm no-underline text-inherit flex gap-2">
                    <span className="mono text-[var(--accent)]">{d.codigo}</span>{TIPOS[d.tipo].nombre} · {fechaHumana(d.emitido_en)}{d.estado === 'anulado' && ' · anulado'}
                  </Link>
                ))}
                <button className="btn self-start" onClick={() => setEditando(p)}>Editar datos</button>
              </div>
            )}
          </div>
        ))}
      </div>
      {editando && <PacienteForm paciente={editando} onCerrar={() => setEditando(null)} onGuardado={() => { setEditando(null); cargar() }} />}
    </div>
  )
}
