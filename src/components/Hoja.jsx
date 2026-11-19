import { useEffect } from 'react'
import { X } from 'lucide-react'

// Ventana tipo "hoja" que sube desde abajo (celular) o modal centrada (PC)
export default function Hoja({ titulo, onCerrar, children, pie }) {
  useEffect(() => {
    const esc = (e) => e.key === 'Escape' && onCerrar()
    document.addEventListener('keydown', esc)
    document.body.style.overflow = 'hidden'
    return () => { document.removeEventListener('keydown', esc); document.body.style.overflow = '' }
  }, [onCerrar])
  return (
    <div className="velo" onClick={onCerrar}>
      <div className="hoja" role="dialog" aria-modal="true" aria-label={titulo} onClick={(e) => e.stopPropagation()}>
        <div className="asa" />
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[26px] m-0">{titulo}</h2>
          <button className="btn !px-0 w-11" aria-label="Cerrar" onClick={onCerrar}><X size={18} /></button>
        </div>
        {children}
        {pie && <div className="sticky bottom-0 pt-3 mt-3 bg-[var(--surface)] border-t border-[var(--line)]">{pie}</div>}
      </div>
    </div>
  )
}
