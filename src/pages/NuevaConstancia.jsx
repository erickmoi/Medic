import { hoyISO } from '../lib/util'
import { useAjustes } from '../lib/ajustes'
import PacienteSelector from '../components/PacienteSelector.jsx'
import Diagnostico from '../components/Diagnostico.jsx'
import CabeceraForm from '../components/CabeceraForm.jsx'
import { useOpciones, useBorrador, fotoPaciente, OpcionesEmision, BotonEmitir } from '../components/Emision.jsx'

const ahora = () => new Date().toLocaleTimeString('en-GB', { timeZone: 'America/El_Salvador', hour: '2-digit', minute: '2-digit' })
const INICIAL = () => ({ paciente: null, fecha_consulta: hoyISO(), hora_inicio: '', hora_fin: '', con_dx: false, dx: null, acompanante: '', nota: '' })

export default function NuevaConstancia() {
  const [b, setB, limpiar] = useBorrador('constancia', INICIAL())
  const [op, setOp] = useOpciones('constancia', 'carta')
  const ajustes = useAjustes()
  const set = (k) => (e) => setB({ ...b, [k]: e.target.value })
  const contenido = {
    fecha_emision: hoyISO(), fecha_consulta: b.fecha_consulta, hora_inicio: b.hora_inicio, hora_fin: b.hora_fin, paciente: fotoPaciente(b.paciente),
    dx: b.con_dx ? b.dx : null, codigo_modo: ajustes.codigo_diagnostico, acompanante: b.acompanante.trim(), nota: b.nota.trim(),
  }
  const valido = !!b.paciente

  return (
    <div className="flex flex-col gap-4 entrar pb-6">
      <CabeceraForm titulo="Constancia médica" mostrarLimpiar={!!b.paciente} onLimpiar={limpiar} />
      <PacienteSelector paciente={b.paciente} onCambiar={(p) => setB({ ...b, paciente: p })} />

      <section className="tarjeta grid grid-cols-2 gap-3">
        <div className="campo col-span-2"><label htmlFor="fc">Fecha de la consulta</label><input id="fc" type="date" className="input" value={b.fecha_consulta} onChange={set('fecha_consulta')} /></div>
        <div className="campo"><label htmlFor="hi">Desde (hora)</label>
          <div className="flex gap-2"><input id="hi" type="time" className="input min-w-0" value={b.hora_inicio} onChange={set('hora_inicio')} /><button className="btn !px-2 text-xs flex-none" onClick={() => setB({ ...b, hora_inicio: ahora() })}>Ahora</button></div></div>
        <div className="campo"><label htmlFor="hf">Hasta (hora)</label>
          <div className="flex gap-2"><input id="hf" type="time" className="input min-w-0" value={b.hora_fin} onChange={set('hora_fin')} /><button className="btn !px-2 text-xs flex-none" onClick={() => setB({ ...b, hora_fin: ahora() })}>Ahora</button></div></div>
        <div className="campo col-span-2"><label htmlFor="ac">Acompañante de (opcional)</label><input id="ac" className="input" placeholder="Si asistió acompañando a un familiar" value={b.acompanante} onChange={set('acompanante')} /></div>
        <div className="col-span-2 flex justify-between items-center">
          <span className="font-semibold text-sm">Incluir diagnóstico</span>
          <button role="switch" aria-checked={b.con_dx} aria-label="Incluir diagnóstico" className="interruptor" onClick={() => setB({ ...b, con_dx: !b.con_dx })} />
        </div>
        {b.con_dx && <div className="col-span-2"><Diagnostico value={b.dx} onChange={(dx) => setB((x) => ({ ...x, dx }))} /></div>}
        <div className="campo col-span-2"><label htmlFor="no">Nota adicional (opcional)</label><textarea id="no" className="input" placeholder="Se recomienda reposo el resto del día." value={b.nota} onChange={set('nota')} /></div>
      </section>

      <OpcionesEmision op={op} setOp={setOp} />
      <BotonEmitir tipo="constancia" paciente={b.paciente} op={op} contenido={contenido} valido={valido} onEmitido={limpiar} />
      {!valido && <p className="text-xs text-[var(--muted)] text-center m-0">Falta elegir el paciente.</p>}
    </div>
  )
}
