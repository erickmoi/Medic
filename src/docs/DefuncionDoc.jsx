import { Encabezado, Firmas, Pie, Anulado, nombreMedico } from './Partes.jsx'
import { fechaLarga } from '../lib/util'
import { textoCodigo } from '../lib/ajustes'

const hh = (h) => { if (!h) return ''; const [a, b] = h.split(':'); return `las ${a} horas con ${b} minutos` }

export default function DefuncionDoc({ doc, medico }) {
  const c = doc.contenido
  const f = c.fallecido || {}
  const l = c.lugar || {}
  const inf = c.informante || {}
  const fem = medico.titulo === 'Dra.'
  const cod = (dx) => (dx ? textoCodigo(dx, c.codigo_modo).replace(' · ', '\n') : '')
  const causas = [['a) Causa directa', c.causas?.a], ['b) Debida a', c.causas?.b], ['c) Causa básica', c.causas?.c], ['Parte II · Otros estados', c.causas?.ii]].filter(([, d]) => d?.nombre)
  const cel = { padding: '6px 12px', border: '1px solid #C9D3D5' }
  const th = { ...cel, background: '#F1F6F6', fontWeight: 600, color: '#2E353B', textAlign: 'left' }
  const lugar = [l.detalle, l.distrito && `distrito ${l.distrito}`, l.municipio && `municipio ${l.municipio}`, l.departamento && `departamento de ${l.departamento}`].filter(Boolean).join(', ')
  return (
    <div className="doc carta" style={{ paddingTop: 44 }}>
      <Encabezado medico={medico} codigo={doc.codigo} />
      <h1 className="d-titulo" style={{ margin: '18px 0 12px', fontSize: 32 }}>Constancia médica de defunción</h1>
      <p className="d-p" style={{ fontSize: 14.5, lineHeight: 1.5, marginBottom: 10 }}>
        {fem ? 'La infrascrita' : 'El infrascrito'}, <b>{nombreMedico(medico)}</b>, {fem ? 'Doctora en Medicina inscrita' : 'Doctor en Medicina inscrito'} en la Junta de Vigilancia de la Profesión
        Médica con el número <b>{medico.jvpm}</b>, <b>HACE CONSTAR</b> que reconoció el cadáver de la persona que se detalla y que, según dictamen médico, falleció en las circunstancias siguientes:
      </p>
      <table className="w-full border-collapse mb-2.5" style={{ fontSize: 13.5 }}>
        <caption className="text-left text-[12px] font-bold tracking-[.06em] uppercase text-[#15606A] pb-1">Datos del fallecido</caption>
        <tbody>
          <tr><th scope="row" style={{ ...th, width: '26%' }}>Nombre</th><td colSpan={3} style={{ ...cel, fontWeight: 700 }}>{f.nombre}</td></tr>
          <tr><th scope="row" style={th}>Edad · Sexo</th><td style={cel}>{[f.edad, f.sexo].filter(Boolean).join(' · ')}</td><th scope="row" style={{ ...th, width: '10%' }}>DUI</th><td style={{ ...cel, fontFamily: 'var(--mono)' }}>{f.dui || '—'}</td></tr>
          <tr><th scope="row" style={th}>Fecha y hora</th><td colSpan={3} style={cel}>{fechaLarga(c.fecha_muerte)}, a {hh(c.hora_muerte)}</td></tr>
          <tr><th scope="row" style={th}>Lugar</th><td colSpan={3} style={cel}>{[l.tipo, lugar].filter(Boolean).join(' · ')}</td></tr>
        </tbody>
      </table>
      <table className="w-full border-collapse mb-2.5" style={{ fontSize: 13.5 }}>
        <caption className="text-left text-[12px] font-bold tracking-[.06em] uppercase text-[#15606A] pb-1">Causas de la defunción</caption>
        <thead><tr><th style={{ ...th, width: '26%' }}>Parte I</th><th style={th}>Enfermedad o estado</th><th style={{ ...th, width: '22%' }}>Código</th></tr></thead>
        <tbody>
          {causas.map(([k, d]) => <tr key={k}><td style={cel}>{k}</td><td style={{ ...cel, fontWeight: k.startsWith('a') ? 600 : 400 }}>{d.nombre}</td><td style={{ ...cel, fontFamily: 'var(--mono)', fontSize: 12, whiteSpace: 'pre-line' }}>{cod(d)}</td></tr>)}
          <tr><td style={cel}>Tipo de muerte</td><td colSpan={2} style={cel}>{c.tipo_muerte}</td></tr>
        </tbody>
      </table>
      {inf.nombre && (
        <p className="d-p" style={{ fontSize: 14.5, lineHeight: 1.5, marginBottom: 8 }}>
          Sirve de testigo e informante <b>{inf.nombre}</b>{inf.parentesco && <>, {inf.parentesco}</>}{inf.edad && <>, de {inf.edad} años de edad</>}{inf.dui && <>, con DUI n.º {inf.dui}</>}{inf.residencia && <>, con residencia en {inf.residencia}</>}.
        </p>
      )}
      <p className="d-p" style={{ fontSize: 14.5, lineHeight: 1.5, marginBottom: 0 }}>
        Y para efectos de inhumación y asentamiento en el Registro del Estado Familiar, se extiende la presente en {c.emision_lugar || medico.ciudad || 'San Salvador'}, a {hh(c.hora_emision)} del día {fechaLarga(c.fecha_emision)}.
      </p>
      <Firmas medico={medico} conFirma={doc.con_firma} conNombre />
      <Pie medico={medico} />
      <Anulado doc={doc} />
    </div>
  )
}
