import { useEffect, useState } from 'react'
import { urlFirmada } from '../lib/supabase'

export function nombreMedico(m) { return `${m.titulo} ${m.nombre}` }

export function Encabezado({ medico, codigo }) {
  return (
    <header className="d-header">
      <span className="d-mono">{medico.iniciales}</span>
      <div className="flex flex-col flex-1 gap-[1px]">
        <span className="d-nombre">{nombreMedico(medico)}</span>
        <span className="d-sub">{medico.profesion} · {medico.especialidad} · J.V.P.M. {medico.jvpm}</span>
      </div>
      <span className="d-codigo">{codigo}</span>
    </header>
  )
}

// Carga la firma y el sello (si el documento los lleva y la imagen está disponible)
export function useFirmas(medico, conFirma) {
  const [img, setImg] = useState({ firma: null, sello: null })
  useEffect(() => {
    if (!conFirma) { setImg({ firma: null, sello: null }); return }
    Promise.all([urlFirmada(medico.firma_path), urlFirmada(medico.sello_path)])
      .then(([firma, sello]) => setImg({ firma, sello }))
  }, [medico.firma_path, medico.sello_path, conFirma])
  return img
}

export function Firmas({ medico, conFirma, conNombre }) {
  const { firma, sello } = useFirmas(medico, conFirma)
  return (
    <div className="d-firmas">
      <div className="d-firma">
        <span className="d-linea">{firma && <img src={firma} alt="Firma" crossOrigin="anonymous" />}</span>
        {conNombre && <span className="text-[14px] font-semibold text-[#16191C]">{nombreMedico(medico)}</span>}
        <span>Firma</span>
      </div>
      <div className={`d-sello ${sello ? 'con-img' : ''}`}>{sello ? <img src={sello} alt="Sello" crossOrigin="anonymous" /> : 'Sello J.V.P.M.'}</div>
    </div>
  )
}

export function Pie({ medico }) {
  const contacto = [medico.telefono, medico.correo_contacto].filter(Boolean).join(' · ')
  return (
    <footer className="d-pie">
      <span>{contacto || ' '}</span>
      <span>{[medico.direccion, medico.ciudad || 'San Salvador'].filter(Boolean).join(', ')}</span>
    </footer>
  )
}

export function Anulado({ doc }) {
  if (doc.estado !== 'anulado') return null
  return <div className="d-anulado" aria-label="Documento anulado"><span>ANULADO</span></div>
}
