import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Search } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/auth.jsx'
import { fechaHumana, TIPOS } from '../lib/util'

export default function Historial() {
  const { cuenta } = useAuth()
  const [docs, setDocs] = useState(null)
  const [tipo, setTipo] = useState('todos')
  const [quien, setQuien] = useState('mios')
  const [q, setQ] = useState('')

  useEffect(() => {
    supabase.from('documentos').select('id, codigo, tipo, estado, emitido_en, homologado, medico_id, nombre:contenido->paciente->>nombre, fallecido:contenido->fallecido->>nombre')
      .order('emitido_en', { ascending: false }).limit(500)
      .then(({ data }) => setDocs(data || []))
  }, [])

  const lista = (docs || []).filter((d) =>
    (tipo === 'todos' || d.tipo === tipo) &&
    (quien === 'todos' || d.medico_id === cuenta.id) &&
    (!q.trim() || `${d.codigo} ${d.nombre || d.fallecido || ''}`.toLowerCase().includes(q.trim().toLowerCase())))

  function exportarCSV() {
    const filas = [['Código', 'Tipo', 'Paciente', 'Fecha', 'Estado', 'Homologado']]
      .concat(lista.map((d) => [d.codigo, TIPOS[d.tipo].nombre, d.nombre || d.fallecido || '', new Date(d.emitido_en).toLocaleString('es-SV'), d.estado, d.homologado ? 'Sí' : '']))
    const csv = '﻿' + filas.map((f) => f.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n')
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' })); a.download = 'historial-medic.csv'; a.click()
  }

  return (
    <div className="flex flex-col gap-4 entrar">
      <div className="flex justify-between items-center"><h1 className="titulo">Historial</h1>
        <button className="btn" onClick={exportarCSV} disabled={!lista.length}>Exportar CSV</button></div>
      <label className="flex items-center gap-2 input">
        <Search size={18} color="var(--muted)" aria-hidden="true" />
        <input className="border-0 outline-0 flex-1 bg-transparent text-base" placeholder="Buscar por paciente o código" aria-label="Buscar documento" value={q} onChange={(e) => setQ(e.target.value)} />
      </label>
      <div className="segmentado">
        <button className={quien === 'mios' ? 'activo' : ''} onClick={() => setQuien('mios')}>Míos</button>
        <button className={quien === 'todos' ? 'activo' : ''} onClick={() => setQuien('todos')}>De los dos</button>
      </div>
      <div className="flex gap-2 flex-wrap">
        {['todos', 'receta', 'incapacidad', 'estudios', 'salud', 'constancia', 'defuncion'].map((t) => <button key={t} className={`chip ${tipo === t ? 'activo' : ''}`} onClick={() => setTipo(t)}>{t === 'todos' ? 'Todos' : TIPOS[t].nombre}</button>)}
      </div>
      <div className="tarjeta !p-0 overflow-hidden">
        {docs === null && [0, 1, 2, 3].map((i) => <div key={i} className="esqueleto h-12 m-3" />)}
        {docs && lista.length === 0 && <p className="p-4 m-0 text-sm text-[var(--muted)]">No hay documentos con esos filtros.</p>}
        {lista.map((d) => (
          <Link key={d.id} to={`/documento/${d.id}`} className="fila">
            <span className="mono text-xs text-[var(--accent)] w-16">{d.codigo}</span>
            <div className="flex flex-col flex-1 min-w-0">
              <span className="font-semibold text-[15px] truncate">{TIPOS[d.tipo].nombre} · {d.nombre || d.fallecido || 'Sin paciente'}</span>
              <span className="text-xs text-[var(--muted)]">{fechaHumana(d.emitido_en)}</span>
            </div>
            {d.estado === 'anulado' && <span className="insignia peligro">Anulado</span>}
            {['incapacidad', 'defuncion'].includes(d.tipo) && d.estado !== 'anulado' && <span className={`insignia ${d.homologado ? '' : 'aviso'}`}>{d.tipo === 'defuncion' ? (d.homologado ? 'Asentada' : 'Sin asentar') : (d.homologado ? 'Homologada' : 'Sin homologar')}</span>}
          </Link>
        ))}
      </div>
    </div>
  )
}
