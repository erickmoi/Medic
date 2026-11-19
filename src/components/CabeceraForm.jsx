import { Link } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'

export default function CabeceraForm({ titulo, onLimpiar, mostrarLimpiar }) {
  return (
    <header className="flex items-center gap-3">
      <Link to="/" className="btn !px-0 w-11 flex-none" aria-label="Volver"><ChevronLeft size={20} /></Link>
      <h1 className="titulo flex-1 !text-[30px]">{titulo}</h1>
      {mostrarLimpiar && <button className="text-sm text-[var(--muted)] bg-transparent border-0 cursor-pointer min-h-11" onClick={onLimpiar}>Limpiar</button>}
    </header>
  )
}
