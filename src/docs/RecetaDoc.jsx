import { Encabezado, Firmas, Pie, Anulado } from './Partes.jsx'
import { fechaCorta } from '../lib/util'
import { dxDe, textoCodigo } from '../lib/ajustes'

export default function RecetaDoc({ doc, medico }) {
  const c = doc.contenido
  const p = c.paciente || {}
  const dx = dxDe(c)
  const cod = textoCodigo(dx, c.codigo_modo)
  const carta = doc.tamano === 'carta'
  const fs = carta ? 16 : 14
  return (
    <div className={`doc ${doc.tamano}`}>
      <Encabezado medico={medico} codigo={doc.codigo} />
      <div className="flex flex-col gap-1.5 py-3.5 border-b border-[#D9DEE2]" style={{ fontSize: carta ? 15 : 13 }}>
        <div className="flex justify-between gap-3"><Dato k="Paciente" v={p.nombre} /><Dato k="Fecha" v={fechaCorta(c.fecha)} /></div>
        <div className="flex flex-wrap gap-x-5 gap-y-1">
          <Dato k="Edad" v={p.edad} />
          <Dato k="Sexo" v={p.sexo} />
          {p.peso_kg && <Dato k="Peso" v={`${p.peso_kg} kg`} />}
          <Dato k="Alergias" v={p.alergias || 'NC'} />
        </div>
        {dx && <Dato k="Dx" v={`${dx.nombre}${cod ? ` (${cod})` : ''}`} />}
      </div>
      <div className="flex gap-3.5 pt-4 flex-1 min-h-0">
        <span className="serif leading-[.9] text-[#15606A]" style={{ fontSize: carta ? 56 : 44 }}>℞</span>
        <ol className="m-0 pl-[18px] flex flex-col gap-3.5" style={{ fontSize: fs, lineHeight: 1.45 }}>
          {(c.items || []).map((it, i) => (
            <li key={i}>
              <b>{it.generico}</b> {it.presentacion}{it.cantidad && <> — <b className="font-semibold">{it.cantidad}</b></>}
              {it.indicacion && <><br /><span className="text-[#2E353B]">{it.indicacion}</span></>}
            </li>
          ))}
        </ol>
      </div>
      {c.indicaciones && (
        <div className="bg-[#F1F6F6] rounded-[10px] px-3 py-2.5 flex flex-col gap-0.5 text-[#2E353B]" style={{ fontSize: carta ? 14 : 12, lineHeight: 1.45 }}>
          <span className="font-bold text-[#15606A]">Indicaciones</span>
          <span className="whitespace-pre-line">{c.indicaciones}</span>
        </div>
      )}
      <Firmas medico={medico} conFirma={doc.con_firma} />
      <Pie medico={medico} />
      <Anulado doc={doc} />
    </div>
  )
}

function Dato({ k, v }) {
  return (
    <div className="flex gap-1.5">
      <span className="text-[#4A535B]">{k}:</span><span className="font-semibold">{v || '—'}</span>
    </div>
  )
}
