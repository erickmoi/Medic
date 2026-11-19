import { Encabezado, Firmas, Pie, Anulado, nombreMedico } from './Partes.jsx'
import { fechaLarga, fechaEnLetras, fechaCorta } from '../lib/util'

export function imc(peso, talla) {
  const p = Number(peso), t = Number(talla)
  if (!p || !t) return null
  const v = p / (t * t)
  const clase = v < 18.5 ? 'bajo peso' : v < 25 ? 'normal' : v < 30 ? 'sobrepeso' : 'obesidad'
  return `${v.toFixed(1)} · ${clase}`
}

export default function SaludDoc({ doc, medico }) {
  const c = doc.contenido
  const p = c.paciente || {}
  const fem = medico.titulo === 'Dra.'
  const pf = p.sexo === 'F'
  const sv = c.signos || {}
  const vit = [['Presión arterial', sv.pa && `${sv.pa} mmHg`], ['Frec. cardíaca', sv.fc && `${sv.fc} lpm`], ['Frec. respiratoria', sv.fr && `${sv.fr} rpm`], ['Temperatura', sv.temp && `${sv.temp} °C`],
    ['Peso', sv.peso && `${sv.peso} kg`], ['Talla', sv.talla && `${sv.talla} m`], ['IMC', imc(sv.peso, sv.talla)]].filter(([, v]) => v)
  const labs = (c.laboratorios || []).filter((l) => l.resultado?.trim())
  const st = { fontSize: 15, lineHeight: 1.5, marginBottom: 12 }
  return (
    <div className="doc carta">
      <Encabezado medico={medico} codigo={doc.codigo} />
      <h1 className="d-titulo" style={{ margin: '20px 0 12px', fontSize: 32 }}>Certificado de salud</h1>
      <p className="d-p" style={st}>
        {fem ? 'La suscrita' : 'El suscrito'}, <b>{nombreMedico(medico)}</b>, {fem ? 'Doctora en Medicina inscrita' : 'Doctor en Medicina inscrito'} en la Junta de Vigilancia de la
        Profesión Médica con el número <b>{medico.jvpm}</b>, <b>CERTIFICA</b> que {pf ? 'evaluó' : 'evaluó'} el día {fechaLarga(c.fecha_evaluacion)} a <b>{p.nombre}</b>
        {p.edad && <>, de {p.edad} de edad</>}{p.dui && <>, con DUI n.º {p.dui}</>}, con los siguientes resultados:
      </p>
      {vit.length > 0 && (
        <div className="grid grid-cols-4 border border-[#C9D3D5] rounded-[10px] mb-4 overflow-hidden">
          {vit.map(([k, v]) => (
            <div key={k} className="px-3.5 py-2 border-r border-b border-[#C9D3D5] -mr-px -mb-px flex flex-col gap-0.5" style={k === 'IMC' ? { gridColumn: 'span 2' } : undefined}>
              <span className="text-[12px] text-[#4A535B]">{k}</span><span className="mono text-[15px]">{v}</span>
            </div>
          ))}
        </div>
      )}
      {labs.length > 0 && (
        <table className="d-tabla d-compacta" style={{ fontSize: 13.5, marginBottom: 14 }}>
          <caption className="text-left text-[12px] font-bold tracking-[.06em] uppercase text-[#15606A] pb-1.5">Exámenes de laboratorio</caption>
          <thead><tr><th style={{ width: '36%' }}>Examen</th><th style={{ width: 'auto' }}>Resultado</th><th style={{ width: '16%' }}>Fecha</th></tr></thead>
          <tbody>{labs.map((l) => <tr key={l.nombre}><td className="font-semibold">{l.nombre}</td><td>{l.resultado}</td><td className="mono">{fechaCorta(l.fecha)}</td></tr>)}</tbody>
        </table>
      )}
      {c.examen_fisico && <p className="d-p" style={st}><b>Examen físico:</b> {c.examen_fisico}</p>}
      <p className="d-p" style={st}><b>Conclusión:</b> al momento de la evaluación se encuentra <b>{c.conclusion || (pf ? 'clínicamente sana y apta' : 'clínicamente sano y apto')}</b>{c.apto_para && <> para <b>{c.apto_para}</b></>}.</p>
      <p className="d-p" style={st}>Este certificado refleja el estado de salud a la fecha de la evaluación{c.vigencia_dias ? ` y es válido por ${c.vigencia_dias} días` : ''}. Se extiende en {medico.ciudad || 'San Salvador'}, {fechaEnLetras(c.fecha_emision)}.</p>
      <Firmas medico={medico} conFirma={doc.con_firma} conNombre />
      <Pie medico={medico} />
      <Anulado doc={doc} />
    </div>
  )
}
