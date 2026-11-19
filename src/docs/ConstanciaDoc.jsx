import { Encabezado, Firmas, Pie, Anulado, nombreMedico } from './Partes.jsx'
import { fechaLarga, fechaEnLetras } from '../lib/util'
import { dxDe, textoCodigo } from '../lib/ajustes'

const hora = (h) => (h ? new Date(`2000-01-01T${h}`).toLocaleTimeString('es-SV', { hour: 'numeric', minute: '2-digit' }) : '')

export default function ConstanciaDoc({ doc, medico }) {
  const c = doc.contenido
  const p = c.paciente || {}
  const fem = medico.titulo === 'Dra.'
  const dx = dxDe(c)
  const cod = textoCodigo(dx, c.codigo_modo)
  const media = doc.tamano === 'media_carta'
  const st = media ? { fontSize: 13, lineHeight: 1.55 } : undefined
  return (
    <div className={`doc ${doc.tamano}`}>
      <Encabezado medico={medico} codigo={doc.codigo} />
      <h1 className="d-titulo" style={media ? { fontSize: 26, margin: '22px 0 16px' } : undefined}>Constancia médica</h1>
      <p className="d-p font-semibold" style={st}>A quien interese:</p>
      <p className="d-p" style={st}>
        {fem ? 'La suscrita' : 'El suscrito'}, <b>{nombreMedico(medico)}</b>, {fem ? 'Doctora en Medicina inscrita' : 'Doctor en Medicina inscrito'} en la Junta de Vigilancia de la
        Profesión Médica con el número <b>{medico.jvpm}</b>, <b>HACE CONSTAR</b> que <b>{p.nombre}</b>{p.edad && <>, de {p.edad} de edad</>}{p.dui && <>, con DUI n.º {p.dui}</>},
        asistió a consulta médica el día {fechaLarga(c.fecha_consulta)}{c.hora_inicio && <> de {hora(c.hora_inicio)}{c.hora_fin && <> a {hora(c.hora_fin)}</>}</>}
        {c.acompanante && <>, en calidad de acompañante de {c.acompanante}</>}{dx && <>, con diagnóstico de <b>{dx.nombre}</b>{cod && <> ({cod})</>}</>}.
      </p>
      {c.nota && <p className="d-p whitespace-pre-line" style={st}>{c.nota}</p>}
      <p className="d-p" style={st}>Y para los usos que se estime convenientes, se extiende la presente en {medico.ciudad || 'San Salvador'}, {fechaEnLetras(c.fecha_emision)}.</p>
      <Firmas medico={medico} conFirma={doc.con_firma} conNombre />
      <Pie medico={medico} />
      <Anulado doc={doc} />
    </div>
  )
}
