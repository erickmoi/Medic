import { hoyISO } from '../lib/util'
import { useAjustes } from '../lib/ajustes'
import PacienteSelector from '../components/PacienteSelector.jsx'
import Diagnostico from '../components/Diagnostico.jsx'
import CabeceraForm from '../components/CabeceraForm.jsx'
import { useOpciones, useBorrador, fotoPaciente, OpcionesEmision, BotonEmitir } from '../components/Emision.jsx'

const DEPTOS = ['Ahuachapán', 'Cabañas', 'Chalatenango', 'Cuscatlán', 'La Libertad', 'La Paz', 'La Unión', 'Morazán', 'San Miguel', 'San Salvador', 'San Vicente', 'Santa Ana', 'Sonsonate', 'Usulután']
const ahora = () => new Date().toLocaleTimeString('en-GB', { timeZone: 'America/El_Salvador', hour: '2-digit', minute: '2-digit' })
const INICIAL = () => ({
  paciente: null, fecha_muerte: hoyISO(), hora_muerte: '', lugar: { tipo: 'Domicilio', detalle: '', distrito: '', municipio: '', departamento: 'San Salvador' },
  causas: { a: null, b: null, c: null, ii: null }, tipo_muerte: 'Natural',
  informante: { nombre: '', parentesco: '', edad: '', dui: '', residencia: '' }, fecha_emision: hoyISO(), hora_emision: '', emision_lugar: 'San Salvador',
})

export default function NuevaDefuncion() {
  const [b, setB, limpiar] = useBorrador('defuncion', INICIAL())
  const [op, setOp] = useOpciones('defuncion', 'carta')
  const ajustes = useAjustes()
  const setL = (k) => (e) => setB({ ...b, lugar: { ...b.lugar, [k]: e.target.value } })
  const setI = (k) => (e) => setB({ ...b, informante: { ...b.informante, [k]: e.target.value } })
  const setC = (k) => (dx) => setB((x) => ({ ...x, causas: { ...x.causas, [k]: dx } }))

  // La constancia no puede ser anterior al fallecimiento
  const muerte = b.fecha_muerte && b.hora_muerte ? `${b.fecha_muerte}T${b.hora_muerte}` : null
  const emision = b.fecha_emision && b.hora_emision ? `${b.fecha_emision}T${b.hora_emision}` : null
  const fechasMal = muerte && emision && emision < muerte
  const duiMal = b.informante.dui && !/^\d{8}-\d$/.test(b.informante.dui)

  const contenido = { ...b, paciente: undefined, fallecido: fotoPaciente(b.paciente), codigo_modo: ajustes.codigo_diagnostico }
  const valido = b.paciente && b.hora_muerte && b.hora_emision && b.causas.a?.nombre && !fechasMal && !duiMal

  return (
    <div className="flex flex-col gap-4 entrar pb-6">
      <CabeceraForm titulo="Defunción" mostrarLimpiar={!!b.paciente} onLimpiar={limpiar} />
      <PacienteSelector paciente={b.paciente} onCambiar={(p) => setB({ ...b, paciente: p })} />
      <p className="text-xs text-[var(--muted)] m-0 -mt-2">Para el fallecido usa nombre completo, fecha de nacimiento, sexo y DUI.</p>

      <section className="tarjeta grid grid-cols-2 gap-3">
        <span className="etiqueta col-span-2">Fallecimiento</span>
        <div className="campo"><label htmlFor="fm">Fecha</label><input id="fm" type="date" className="input" value={b.fecha_muerte} onChange={(e) => setB({ ...b, fecha_muerte: e.target.value })} /></div>
        <div className="campo"><label htmlFor="hm">Hora</label><input id="hm" type="time" className="input" value={b.hora_muerte} onChange={(e) => setB({ ...b, hora_muerte: e.target.value })} /></div>
        <div className="campo col-span-2"><label>Lugar</label>
          <div className="segmentado">{['Domicilio', 'Hospital', 'Vía pública', 'Otro'].map((t) => <button key={t} className={b.lugar.tipo === t ? 'activo' : ''} onClick={() => setB({ ...b, lugar: { ...b.lugar, tipo: t } })}>{t}</button>)}</div></div>
        <div className="campo col-span-2"><label htmlFor="ld">Dirección o lugar</label><input id="ld" className="input" placeholder="Cantón, caserío, colonia o nombre del hospital" value={b.lugar.detalle} onChange={setL('detalle')} /></div>
        <div className="campo"><label htmlFor="ldi">Distrito</label><input id="ldi" className="input" value={b.lugar.distrito} onChange={setL('distrito')} /></div>
        <div className="campo"><label htmlFor="lmu">Municipio</label><input id="lmu" className="input" placeholder="San Salvador Centro" value={b.lugar.municipio} onChange={setL('municipio')} /></div>
        <div className="campo col-span-2"><label htmlFor="lde">Departamento</label><select id="lde" className="input" value={b.lugar.departamento} onChange={setL('departamento')}>{DEPTOS.map((d) => <option key={d}>{d}</option>)}</select></div>
      </section>

      <section className="tarjeta flex flex-col gap-4">
        <span className="etiqueta">Causas (formato OMS)</span>
        <Diagnostico id="ca" etiqueta="a) Causa directa" value={b.causas.a} onChange={setC('a')} />
        <Diagnostico id="cb" etiqueta="b) Debida a" value={b.causas.b} onChange={setC('b')} />
        <Diagnostico id="cc" etiqueta="c) Causa básica (opcional)" value={b.causas.c} onChange={setC('c')} />
        <Diagnostico id="cii" etiqueta="Parte II · Otros estados (opcional)" value={b.causas.ii} onChange={setC('ii')} />
        <div className="campo"><label>Tipo de muerte</label>
          <div className="segmentado">{['Natural', 'Violenta', 'En estudio'].map((t) => <button key={t} className={b.tipo_muerte === t ? 'activo' : ''} onClick={() => setB({ ...b, tipo_muerte: t })}>{t}</button>)}</div></div>
        {b.tipo_muerte !== 'Natural' && <p className="insignia aviso !text-sm !font-normal m-0 !rounded-xl !p-3">En muerte violenta o sospechosa corresponde dar aviso a las autoridades y a Medicina Legal.</p>}
      </section>

      <section className="tarjeta grid grid-cols-2 gap-3">
        <span className="etiqueta col-span-2">Testigo e informante</span>
        <div className="campo col-span-2"><label htmlFor="in">Nombre</label><input id="in" className="input" value={b.informante.nombre} onChange={setI('nombre')} /></div>
        <div className="campo"><label htmlFor="ip">Parentesco</label><input id="ip" className="input" placeholder="hija" value={b.informante.parentesco} onChange={setI('parentesco')} /></div>
        <div className="campo"><label htmlFor="ie">Edad</label><input id="ie" className="input" inputMode="numeric" value={b.informante.edad} onChange={setI('edad')} /></div>
        <div className="campo col-span-2"><label htmlFor="idu">DUI</label><input id="idu" className="input mono" placeholder="00000000-0" value={b.informante.dui} onChange={setI('dui')} aria-invalid={!!duiMal} />{duiMal && <span className="text-xs text-[var(--danger)]">Formato: 8 dígitos, guion y 1 dígito</span>}</div>
        <div className="campo col-span-2"><label htmlFor="ir">Residencia</label><input id="ir" className="input" value={b.informante.residencia} onChange={setI('residencia')} /></div>
      </section>

      <section className="tarjeta grid grid-cols-2 gap-3">
        <span className="etiqueta col-span-2">Emisión de la constancia</span>
        <div className="campo"><label htmlFor="fem">Fecha</label><input id="fem" type="date" className="input" value={b.fecha_emision} onChange={(e) => setB({ ...b, fecha_emision: e.target.value })} /></div>
        <div className="campo"><label htmlFor="hem">Hora</label><div className="flex gap-2"><input id="hem" type="time" className="input min-w-0" value={b.hora_emision} onChange={(e) => setB({ ...b, hora_emision: e.target.value })} /><button className="btn !px-2 text-xs flex-none" onClick={() => setB({ ...b, hora_emision: ahora() })}>Ahora</button></div></div>
        <div className="campo col-span-2"><label htmlFor="lem">Lugar</label><input id="lem" className="input" value={b.emision_lugar} onChange={(e) => setB({ ...b, emision_lugar: e.target.value })} /></div>
        {fechasMal && <p className="col-span-2 m-0 text-sm p-3 rounded-xl bg-[var(--danger-soft)] text-[var(--danger)]" role="alert">La emisión no puede ser anterior al fallecimiento. Revisa fechas y horas.</p>}
      </section>

      <OpcionesEmision op={{ ...op, tamano: 'carta' }} setOp={(o) => setOp({ ...o, tamano: 'carta' })} soloCarta />
      <BotonEmitir tipo="defuncion" paciente={b.paciente} op={{ ...op, tamano: 'carta' }} contenido={contenido} valido={valido} onEmitido={limpiar} />
      {!valido && <p className="text-xs text-[var(--muted)] text-center m-0">Falta {!b.paciente ? 'elegir al fallecido' : !b.hora_muerte ? 'la hora del fallecimiento' : !b.causas.a?.nombre ? 'la causa directa' : !b.hora_emision ? 'la hora de emisión' : 'corregir los datos marcados'}.</p>}
    </div>
  )
}
