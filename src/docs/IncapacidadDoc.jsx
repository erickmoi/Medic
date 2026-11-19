import { Encabezado, Firmas, Pie, Anulado, nombreMedico } from './Partes.jsx'
import { fechaLarga, fechaEnLetras, numALetras, diaSemana } from '../lib/util'

export default function IncapacidadDoc({ doc, medico }) {
  const c = doc.contenido
  const p = c.paciente || {}
  const fem = medico.titulo === 'Dra.'
  const pacFem = p.sexo === 'F'
  const media = doc.tamano === 'media_carta'
  const st = media ? { fontSize: 12.5, lineHeight: 1.5 } : undefined
  return (
    <div className={`doc ${doc.tamano}`}>
      <Encabezado medico={medico} codigo={doc.codigo} />
      <h1 className="d-titulo" style={media ? { fontSize: 26, margin: '20px 0 14px' } : undefined}>Constancia de incapacidad médica</h1>
      <p className="d-p font-semibold" style={st}>A quien interese:</p>
      <p className="d-p" style={st}>
        {fem ? 'La suscrita' : 'El suscrito'}, <b>{nombreMedico(medico)}</b>, {fem ? 'Doctora en Medicina inscrita' : 'Doctor en Medicina inscrito'} en
        la Junta de Vigilancia de la Profesión Médica con el número <b>{medico.jvpm}</b>, <b>HACE CONSTAR</b> que <b>{p.nombre}</b>
        {p.edad && <>, de {p.edad} de edad</>}{p.dui && <>, con DUI n.º {p.dui}</>}, fue {pacFem ? 'evaluada' : 'evaluado'} en consulta
        el día {fechaLarga(c.fecha_evaluacion)} y, por los hallazgos clínicos encontrados, se le otorga incapacidad médica según el detalle siguiente:
      </p>
      <table className="d-tabla" style={media ? { fontSize: 12 } : undefined}>
        <tbody>
          <tr><th scope="row">Diagnóstico</th><td className="font-semibold">{c.diagnostico}{c.cie10 && <span className="mono font-medium text-[#4A535B]"> CIE-10 {c.cie10}</span>}</td></tr>
          <tr><th scope="row">Días de incapacidad</th><td className="font-semibold">{c.dias} ({numALetras(c.dias)}) {Number(c.dias) === 1 ? 'día' : 'días'}</td></tr>
          <tr><th scope="row">Período</th><td>Del {fechaLarga(c.desde)} al {fechaLarga(c.hasta)}, ambas fechas inclusive</td></tr>
          <tr><th scope="row">Se reintegra</th><td><span className="capitalize">{diaSemana(c.reintegro)}</span> {fechaLarga(c.reintegro)}</td></tr>
          {c.isss && <tr><th scope="row">N.º de afiliación ISSS</th><td className="mono">{c.isss}</td></tr>}
        </tbody>
      </table>
      <p className="d-p" style={st}>
        Lo anterior para su óptima recuperación y el fiel cumplimiento del tratamiento indicado. Y para los usos que {pacFem ? 'la interesada' : 'el interesado'} estime
        convenientes, se extiende la presente en {medico.ciudad || 'San Salvador'}, {fechaEnLetras(c.fecha_emision)}.
      </p>
      <Firmas medico={medico} conFirma={doc.con_firma} conNombre />
      <Pie medico={medico} />
      <Anulado doc={doc} />
    </div>
  )
}
