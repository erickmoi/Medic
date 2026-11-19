import { hoyISO } from '../lib/util'
import { useAjustes } from '../lib/ajustes'
import PacienteSelector from '../components/PacienteSelector.jsx'
import CabeceraForm from '../components/CabeceraForm.jsx'
import { imc } from '../docs/SaludDoc.jsx'
import { useOpciones, useBorrador, fotoPaciente, OpcionesEmision, BotonEmitir } from '../components/Emision.jsx'

const INICIAL = () => ({ paciente: null, fecha_evaluacion: hoyISO(), signos: { pa: '', fc: '', fr: '', temp: '', peso: '', talla: '' }, labs: {}, examen_fisico: 'Sin hallazgos patológicos.', conclusion: '', apto_para: '', vigencia_dias: 30 })
const APTO = ['realizar actividades laborales', 'realizar actividades académicas', 'realizar actividades deportivas', 'manipular alimentos', 'trámite de licencia de conducir']

export default function NuevaSalud() {
  const [b, setB, limpiar] = useBorrador('salud', INICIAL())
  const [op, setOp] = useOpciones('salud', 'carta')
  const ajustes = useAjustes()
  const examenes = ajustes.salud_examenes || []
  const pf = b.paciente?.sexo === 'F'
  const setS = (k) => (e) => setB({ ...b, signos: { ...b.signos, [k]: e.target.value } })
  const setL = (n, k) => (e) => setB({ ...b, labs: { ...b.labs, [n]: { fecha: hoyISO(), ...b.labs[n], [k]: e.target.value } } })

  const contenido = {
    fecha_emision: hoyISO(), fecha_evaluacion: b.fecha_evaluacion, paciente: fotoPaciente(b.paciente), signos: b.signos,
    laboratorios: examenes.map((n) => ({ nombre: n, resultado: b.labs[n]?.resultado || '', fecha: b.labs[n]?.fecha || '' })).filter((l) => l.resultado.trim()),
    examen_fisico: b.examen_fisico.trim(), conclusion: b.conclusion.trim() || (pf ? 'clínicamente sana y apta' : 'clínicamente sano y apto'),
    apto_para: b.apto_para.trim(), vigencia_dias: Number(b.vigencia_dias) || null,
  }
  const valido = !!b.paciente
  const SIG = [['pa', 'Presión arterial', '110/70', 'text'], ['fc', 'Frec. cardíaca', 'lpm', 'numeric'], ['fr', 'Frec. respiratoria', 'rpm', 'numeric'], ['temp', 'Temperatura', '°C', 'decimal'], ['peso', 'Peso', 'kg', 'decimal'], ['talla', 'Talla', 'm (1.62)', 'decimal']]

  return (
    <div className="flex flex-col gap-4 entrar pb-6">
      <CabeceraForm titulo="Certificado de salud" mostrarLimpiar={!!b.paciente} onLimpiar={limpiar} />
      <PacienteSelector paciente={b.paciente} onCambiar={(p) => setB({ ...b, paciente: p, signos: { ...b.signos, peso: b.signos.peso || p.peso_kg || '' } })} />

      <section className="tarjeta grid grid-cols-2 sm:grid-cols-3 gap-3">
        <span className="etiqueta col-span-full">Signos vitales y medidas</span>
        {SIG.map(([k, t, ph, im]) => <div key={k} className="campo"><label htmlFor={`s-${k}`}>{t}</label><input id={`s-${k}`} className="input mono" inputMode={im} placeholder={ph} value={b.signos[k]} onChange={setS(k)} /></div>)}
        {imc(b.signos.peso, b.signos.talla) && <div className="col-span-full bg-[var(--accent-soft)] rounded-xl p-3 text-sm">IMC: <b>{imc(b.signos.peso, b.signos.talla)}</b></div>}
        <div className="campo col-span-full"><label htmlFor="fe">Fecha de evaluación</label><input id="fe" type="date" className="input" value={b.fecha_evaluacion} onChange={(e) => setB({ ...b, fecha_evaluacion: e.target.value })} /></div>
      </section>

      <section className="tarjeta flex flex-col gap-3">
        <span className="etiqueta">Exámenes de laboratorio</span>
        <p className="text-xs text-[var(--muted)] m-0">Solo se imprimen los que tengan resultado. La lista se cambia en Mi perfil → Exámenes del certificado de salud.</p>
        {examenes.map((n) => (
          <div key={n} className="grid grid-cols-[1fr_140px] gap-2 items-end">
            <div className="campo"><label htmlFor={`l-${n}`}>{n}</label><input id={`l-${n}`} className="input" placeholder="Dentro de límites normales" value={b.labs[n]?.resultado || ''} onChange={setL(n, 'resultado')} /></div>
            <div className="campo"><label htmlFor={`lf-${n}`} className="sr-only">Fecha de {n}</label><input id={`lf-${n}`} type="date" className="input" value={b.labs[n]?.fecha || ''} onChange={setL(n, 'fecha')} /></div>
          </div>
        ))}
      </section>

      <section className="tarjeta flex flex-col gap-3">
        <div className="campo"><label htmlFor="ef">Examen físico</label><textarea id="ef" className="input" value={b.examen_fisico} onChange={(e) => setB({ ...b, examen_fisico: e.target.value })} /></div>
        <div className="campo"><label htmlFor="co">Conclusión</label><input id="co" className="input" placeholder={pf ? 'clínicamente sana y apta' : 'clínicamente sano y apto'} value={b.conclusion} onChange={(e) => setB({ ...b, conclusion: e.target.value })} /></div>
        <div className="campo"><label htmlFor="ap">Apto para</label><input id="ap" className="input" list="apto-lista" value={b.apto_para} onChange={(e) => setB({ ...b, apto_para: e.target.value })} />
          <datalist id="apto-lista">{APTO.map((a) => <option key={a} value={a} />)}</datalist></div>
        <div className="flex flex-wrap gap-2">{APTO.map((a) => <button key={a} className={`chip ${b.apto_para === a ? 'activo' : ''}`} onClick={() => setB({ ...b, apto_para: a })}>{a}</button>)}</div>
        <div className="campo"><label htmlFor="vi">Vigencia (días)</label><input id="vi" className="input mono" inputMode="numeric" value={b.vigencia_dias} onChange={(e) => setB({ ...b, vigencia_dias: e.target.value })} /></div>
      </section>

      <OpcionesEmision op={{ ...op, tamano: 'carta' }} setOp={(o) => setOp({ ...o, tamano: 'carta' })} soloCarta />
      <BotonEmitir tipo="salud" paciente={b.paciente} op={{ ...op, tamano: 'carta' }} contenido={contenido} valido={valido} onEmitido={limpiar} />
      {!valido && <p className="text-xs text-[var(--muted)] text-center m-0">Falta elegir el paciente.</p>}
    </div>
  )
}
