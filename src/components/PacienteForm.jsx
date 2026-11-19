import { useState } from 'react'
import Hoja from './Hoja.jsx'
import { rpc } from '../lib/supabase'
import { useAviso } from './Toast.jsx'

const VACIO = { nombre: '', fecha_nacimiento: '', sexo: '', dui: '', telefono: '', direccion: '', alergias: '', peso_kg: '', notas: '' }

// Crear o editar paciente. onGuardado(paciente)
export default function PacienteForm({ paciente, onCerrar, onGuardado }) {
  const [f, setF] = useState({ ...VACIO, ...Object.fromEntries(Object.entries(paciente || {}).map(([k, v]) => [k, v ?? ''])) })
  const [guardando, setGuardando] = useState(false)
  const aviso = useAviso()
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })
  const duiValido = !f.dui || /^\d{8}-\d$/.test(f.dui)

  async function guardar() {
    setGuardando(true)
    try {
      const p = await rpc('guardar_paciente', { p: f })
      aviso(paciente?.id ? 'Paciente actualizado' : 'Paciente guardado')
      onGuardado(p)
    } catch (e) { aviso(e.message) } finally { setGuardando(false) }
  }

  return (
    <Hoja titulo={paciente?.id ? 'Editar paciente' : 'Nuevo paciente'} onCerrar={onCerrar}
      pie={<button className="btn btn-primario w-full" disabled={guardando || f.nombre.trim().length < 3 || !duiValido} onClick={guardar}>{guardando ? 'Guardando…' : 'Guardar paciente'}</button>}>
      <div className="grid grid-cols-2 gap-3">
        <div className="campo col-span-2"><label htmlFor="pn">Nombre completo</label><input id="pn" className="input" value={f.nombre} onChange={set('nombre')} autoFocus /></div>
        <div className="campo"><label htmlFor="pf">Fecha de nacimiento</label><input id="pf" type="date" className="input" value={f.fecha_nacimiento} onChange={set('fecha_nacimiento')} /></div>
        <div className="campo"><label>Sexo</label>
          <div className="segmentado">
            {['F', 'M'].map((s) => <button key={s} type="button" className={f.sexo === s ? 'activo' : ''} onClick={() => setF({ ...f, sexo: s })}>{s === 'F' ? 'Femenino' : 'Masculino'}</button>)}
          </div>
        </div>
        <div className="campo"><label htmlFor="pd">DUI</label><input id="pd" className="input mono" placeholder="00000000-0" inputMode="numeric" value={f.dui} onChange={set('dui')} aria-invalid={!duiValido} />{!duiValido && <span className="text-xs text-[var(--danger)]">Formato: 8 dígitos, guion y 1 dígito</span>}</div>
        <div className="campo"><label htmlFor="pp">Peso (kg)</label><input id="pp" className="input" inputMode="decimal" value={f.peso_kg} onChange={set('peso_kg')} /></div>
        <div className="campo"><label htmlFor="pt">Teléfono</label><input id="pt" className="input" inputMode="tel" value={f.telefono} onChange={set('telefono')} /></div>
        <div className="campo"><label htmlFor="pa">Alergias</label><input id="pa" className="input" placeholder="Ninguna conocida" value={f.alergias} onChange={set('alergias')} /></div>
        <div className="campo col-span-2"><label htmlFor="pdir">Dirección</label><input id="pdir" className="input" value={f.direccion} onChange={set('direccion')} /></div>
        <div className="campo col-span-2"><label htmlFor="pno">Notas</label><textarea id="pno" className="input" value={f.notas} onChange={set('notas')} /></div>
      </div>
    </Hoja>
  )
}
