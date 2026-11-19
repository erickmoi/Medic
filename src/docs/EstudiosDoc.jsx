import { Encabezado, Firmas, Pie, Anulado } from './Partes.jsx'
import { fechaCorta } from '../lib/util'
import { dxDe, textoCodigo } from '../lib/ajustes'

export default function EstudiosDoc({ doc, medico }) {
  const c = doc.contenido
  const p = c.paciente || {}
  const dx = dxDe(c)
  const cod = textoCodigo(dx, c.codigo_modo)
  const carta = doc.tamano === 'carta'
  const fs = carta ? 16 : 14
  const grupos = [['laboratorio', 'Laboratorio'], ['gabinete', 'Gabinete']]
    .map(([k, t]) => [t, (c.estudios || []).filter((e) => e.tipo === k)]).filter(([, l]) => l.length)
  return (
    <div className={`doc ${doc.tamano}`}>
      <Encabezado medico={medico} codigo={doc.codigo} />
      <h1 className="serif font-normal m-0 mt-4 mb-2" style={{ fontSize: carta ? 34 : 26 }}>Solicitud de exámenes</h1>
      <div className="flex flex-col gap-1.5 pb-3 border-b border-[#D9DEE2]" style={{ fontSize: carta ? 15 : 13 }}>
        <div className="flex justify-between gap-3"><D k="Paciente" v={p.nombre} /><D k="Fecha" v={fechaCorta(c.fecha)} /></div>
        <div className="flex gap-5"><D k="Edad" v={p.edad} /><D k="Sexo" v={p.sexo} /></div>
      </div>
      <div className="flex flex-col gap-4 pt-4 flex-1 min-h-0" style={{ fontSize: fs }}>
        {grupos.map(([t, l]) => (
          <div key={t} className="flex flex-col gap-1.5">
            <span className="text-[12px] font-bold tracking-[.06em] uppercase text-[#15606A]">{t}</span>
            <ol className="m-0 pl-5 flex flex-col gap-1" style={{ lineHeight: 1.4 }}>{l.map((e) => <li key={e.nombre}>{e.nombre}</li>)}</ol>
          </div>
        ))}
      </div>
      <div className="flex flex-col gap-2" style={{ fontSize: carta ? 15 : 13, lineHeight: 1.45 }}>
        {dx && <D k="Impresión diagnóstica" v={`${dx.nombre}${cod ? ` (${cod})` : ''}`} />}
        {c.indicaciones && <div className="bg-[#F1F6F6] rounded-[10px] px-3 py-2 text-[#2E353B] whitespace-pre-line" style={{ fontSize: carta ? 14 : 12 }}>Indicaciones: {c.indicaciones}</div>}
      </div>
      <Firmas medico={medico} conFirma={doc.con_firma} />
      <Pie medico={medico} />
      <Anulado doc={doc} />
    </div>
  )
}
const D = ({ k, v }) => <div className="flex gap-1.5"><span className="text-[#4A535B] flex-none">{k}:</span><span className="font-semibold">{v || '—'}</span></div>
