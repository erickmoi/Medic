import { Link } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import PacienteSelector from '../components/PacienteSelector.jsx'
import { useOpciones, useBorrador, fotoPaciente, OpcionesEmision, BotonEmitir } from '../components/Emision.jsx'
import { hoyISO, sumarDias, fechaLarga, diaSemana, numALetras } from '../lib/util'
import Diagnostico from '../components/Diagnostico.jsx'
import { useAjustes } from '../lib/ajustes'

const INICIAL = () => ({ paciente: null, fecha_evaluacion: hoyISO(), dx: null, dias: 3, desde: hoyISO(), isss: '' })

export default function NuevaIncapacidad() {
  const [b, setB, limpiar] = useBorrador('incapacidad', INICIAL())
  const [op, setOp] = useOpciones('incapacidad', 'carta')
  const set = (k) => (e) => setB({ ...b, [k]: e.target.value })
  const ajustes = useAjustes()

  const dias = Math.max(1, parseInt(b.dias) || 1)
  const hasta = sumarDias(b.desde, dias - 1)
  const reintegro = sumarDias(b.desde, dias)
  const contenido = {
    fecha_emision: hoyISO(), fecha_evaluacion: b.fecha_evaluacion, paciente: fotoPaciente(b.paciente),
    dx: b.dx, codigo_modo: ajustes.codigo_diagnostico, dias, desde: b.desde, hasta, reintegro, isss: b.isss.trim(),
  }
  const valido = b.paciente && b.dx?.nombre?.trim().length > 2 && dias > 0

  return (
    <div className="flex flex-col gap-4 entrar pb-6">
      <header className="flex items-center gap-3">
        <Link to="/" className="btn !px-0 w-11" aria-label="Volver"><ChevronLeft size={20} /></Link>
        <h1 className="titulo flex-1 !text-[30px]">Incapacidad</h1>
        {b.paciente && <button className="text-sm text-[var(--muted)] bg-transparent border-0 cursor-pointer min-h-11" onClick={limpiar}>Limpiar</button>}
      </header>

      <PacienteSelector paciente={b.paciente} onCambiar={(p) => setB({ ...b, paciente: p })} />

      <section className="tarjeta grid grid-cols-2 gap-3">
        <div className="col-span-2"><Diagnostico value={b.dx} onChange={(dx) => setB((x) => ({ ...x, dx }))} /></div>
        <div className="campo col-span-2"><label htmlFor="ev">Fecha de evaluación</label><input id="ev" type="date" className="input" value={b.fecha_evaluacion} onChange={set('fecha_evaluacion')} /></div>
        <div className="campo"><label htmlFor="di">Días de incapacidad</label>
          <div className="flex gap-2 items-center">
            <button type="button" className="btn !px-0 w-11 flex-none" aria-label="Menos un día" onClick={() => setB({ ...b, dias: Math.max(1, dias - 1) })}>−</button>
            <input id="di" className="input text-center mono min-w-0" inputMode="numeric" value={b.dias} onChange={set('dias')} />
            <button type="button" className="btn !px-0 w-11 flex-none" aria-label="Más un día" onClick={() => setB({ ...b, dias: dias + 1 })}>+</button>
          </div>
        </div>
        <div className="campo"><label htmlFor="de">Desde</label><input id="de" type="date" className="input" value={b.desde} onChange={set('desde')} /></div>
        <div className="campo col-span-2"><label htmlFor="is">N.º de afiliación ISSS (opcional)</label><input id="is" className="input mono" inputMode="numeric" value={b.isss} onChange={set('isss')} /></div>
        <div className="col-span-2 bg-[var(--accent-soft)] rounded-xl p-3 text-sm">
          {dias} ({numALetras(dias)}) {dias === 1 ? 'día' : 'días'}: del {fechaLarga(b.desde)} al {fechaLarga(hasta)}. Se reintegra el {diaSemana(reintegro)} {fechaLarga(reintegro)}.
        </div>
      </section>

      <OpcionesEmision op={op} setOp={setOp} />
      <BotonEmitir tipo="incapacidad" paciente={b.paciente} op={op} contenido={contenido} valido={valido} onEmitido={limpiar} />
      {!valido && <p className="text-xs text-[var(--muted)] text-center m-0">Falta {!b.paciente ? 'elegir el paciente' : 'el diagnóstico'}.</p>}
    </div>
  )
}
