import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { rpc } from '../lib/supabase'
import { edad } from '../lib/util'
import { useAviso } from './Toast.jsx'

// Tamaño de hoja y firma: se recuerdan por tipo de documento en el dispositivo
export function useOpciones(tipo, tamanoDef) {
  const k = `medic-opciones-${tipo}`
  const [op, setOp] = useState(() => JSON.parse(localStorage.getItem(k) || 'null') || { tamano: tamanoDef, con_firma: true })
  useEffect(() => { localStorage.setItem(k, JSON.stringify(op)) }, [k, op])
  return [op, setOp]
}

// Borrador que se guarda solo mientras se llena el formulario
export function useBorrador(tipo, inicial) {
  const k = `medic-borrador-${tipo}`
  const [v, setV] = useState(() => JSON.parse(localStorage.getItem(k) || 'null') || inicial)
  useEffect(() => { localStorage.setItem(k, JSON.stringify(v)) }, [k, v])
  const limpiar = () => { localStorage.removeItem(k); setV(inicial) }
  return [v, setV, limpiar]
}

export function fotoPaciente(p) {
  if (!p) return null
  return { id: p.id, nombre: p.nombre, edad: edad(p.fecha_nacimiento), sexo: p.sexo, dui: p.dui, peso_kg: p.peso_kg, alergias: p.alergias }
}

export function OpcionesEmision({ op, setOp }) {
  return (
    <section className="tarjeta flex flex-col gap-3">
      <div className="flex justify-between items-center gap-3">
        <span className="font-semibold text-sm">Tamaño</span>
        <div className="segmentado">
          {[['media_carta', 'Media carta'], ['carta', 'Carta']].map(([k, t]) =>
            <button key={k} type="button" className={op.tamano === k ? 'activo' : ''} onClick={() => setOp({ ...op, tamano: k })}>{t}</button>)}
        </div>
      </div>
      <div className="flex justify-between items-center gap-3">
        <span className="font-semibold text-sm">Firma y sello digital</span>
        <button type="button" role="switch" aria-checked={op.con_firma} aria-label="Firma y sello digital" className="interruptor" onClick={() => setOp({ ...op, con_firma: !op.con_firma })} />
      </div>
    </section>
  )
}

export function BotonEmitir({ tipo, paciente, op, contenido, valido, onEmitido }) {
  const [enviando, setEnviando] = useState(false)
  const aviso = useAviso()
  const nav = useNavigate()
  async function emitir() {
    setEnviando(true)
    try {
      const d = await rpc('emitir_documento', { p_tipo: tipo, p_paciente: paciente?.id || null, p_tamano: op.tamano, p_con_firma: op.con_firma, p_contenido: contenido })
      onEmitido?.()
      aviso(`Documento ${d.codigo} emitido`)
      nav(`/documento/${d.id}`, { replace: true })
    } catch (e) { aviso(e.message); setEnviando(false) }
  }
  return (
    <div className="sticky bottom-[84px] md:bottom-4 z-10">
      <button className="btn btn-primario w-full !min-h-12 shadow-lg" disabled={!valido || enviando} onClick={emitir}>
        {enviando ? 'Emitiendo…' : 'Emitir y ver documento'}
      </button>
    </div>
  )
}
