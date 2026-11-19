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
    supabase.from('documentos').select('id, codigo, tipo, estado, emitido_en, homologado, medico_id, nombre:contenido->paciente->>nombre, fallecido:contenido->fallecido->>nombre, dx:contenido->dx->>nombre')
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
      {docs && <Resumen docs={docs.filter((d) => (quien === 'todos' || d.medico_id === cuenta.id) && d.estado !== 'anulado')} />}
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

function Resumen({ docs }) {
  const mes = new Date().toLocaleDateString('en-CA', { timeZone: 'America/El_Salvador' }).slice(0, 7)
  const delMes = docs.filter((d) => new Date(d.emitido_en).toLocaleDateString('en-CA', { timeZone: 'America/El_Salvador' }).startsWith(mes))
  const porTipo = Object.keys(TIPOS).map((t) => [t, delMes.filter((d) => d.tipo === t).length]).filter(([, n]) => n)
  const conteo = {}
  docs.forEach((d) => { if (d.dx) conteo[d.dx] = (conteo[d.dx] || 0) + 1 })
  const top = Object.entries(conteo).sort((a, b) => b[1] - a[1]).slice(0, 5)
  const max = top[0]?.[1] || 1
  return (
    <details className="tarjeta" open>
      <summary className="cursor-pointer font-semibold text-sm">Resumen · {new Date().toLocaleDateString('es-SV', { month: 'long', year: 'numeric' })}</summary>
      <div className="flex flex-col gap-4 mt-3">
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-[var(--surface-2)] rounded-xl p-3"><div className="mono text-2xl">{delMes.length}</div><div className="text-xs text-[var(--muted)]">documentos este mes</div></div>
          {porTipo.slice(0, 2).map(([t, n]) => <div key={t} className="bg-[var(--surface-2)] rounded-xl p-3"><div className="mono text-2xl">{n}</div><div className="text-xs text-[var(--muted)]">{TIPOS[t].nombre.toLowerCase()}</div></div>)}
        </div>
        {top.length > 0 && (
          <div className="flex flex-col gap-1.5">
            <span className="text-xs text-[var(--muted)]">Diagnósticos más frecuentes</span>
            {top.map(([n, c]) => (
              <div key={n} className="flex items-center gap-2 text-sm">
                <span className="flex-1 truncate">{n}</span>
                <span className="h-2 rounded-full bg-[var(--accent)]" style={{ width: `${(c / max) * 40}%` }} aria-hidden="true" />
                <span className="mono w-6 text-right">{c}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </details>
  )
}
