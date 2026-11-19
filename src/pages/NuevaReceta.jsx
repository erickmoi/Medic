import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft, Trash2 } from 'lucide-react'
import PacienteSelector from '../components/PacienteSelector.jsx'
import Catalogo from '../components/Catalogo.jsx'
import { useOpciones, useBorrador, fotoPaciente, OpcionesEmision, BotonEmitir } from '../components/Emision.jsx'
import { useAviso } from '../components/Toast.jsx'
import { hoyISO, edad } from '../lib/util'
import Diagnostico from '../components/Diagnostico.jsx'
import { useAjustes } from '../lib/ajustes'

const INICIAL = { paciente: null, dx: null, items: [], indicaciones: '' }

export default function NuevaReceta() {
  const [b, setB, limpiar] = useBorrador('receta', INICIAL)
  const [op, setOp] = useOpciones('receta', 'media_carta')
  const [catalogo, setCatalogo] = useState(false)
  const aviso = useAviso()
  const ajustes = useAjustes()

  const setItem = (i, k, v) => setB({ ...b, items: b.items.map((it, j) => (j === i ? { ...it, [k]: v } : it)) })
  const quitar = (i) => {
    const antes = b.items
    setB({ ...b, items: antes.filter((_, j) => j !== i) })
    aviso('Medicamento quitado', { accion: 'Deshacer', alHacer: () => setB((x) => ({ ...x, items: antes })) })
  }
  const mover = (i, d) => {
    const it = [...b.items]; const j = i + d
    if (j < 0 || j >= it.length) return
    ;[it[i], it[j]] = [it[j], it[i]]; setB({ ...b, items: it })
  }
  const esNino = (() => { const e = edad(b.paciente?.fecha_nacimiento); return e && (/mes/.test(e) || parseInt(e) < 12) })()

  const contenido = { fecha: hoyISO(), paciente: fotoPaciente(b.paciente), dx: b.dx, codigo_modo: ajustes.codigo_diagnostico, items: b.items, indicaciones: b.indicaciones.trim() }
  const valido = b.paciente && b.items.length > 0 && b.items.every((it) => it.generico && it.indicacion)

  return (
    <div className="flex flex-col gap-4 entrar pb-6">
      <header className="flex items-center gap-3">
        <Link to="/" className="btn !px-0 w-11" aria-label="Volver"><ChevronLeft size={20} /></Link>
        <h1 className="titulo flex-1 !text-[30px]">Nueva receta</h1>
        {(b.paciente || b.items.length > 0) && <button className="text-sm text-[var(--muted)] bg-transparent border-0 cursor-pointer min-h-11" onClick={limpiar}>Limpiar</button>}
      </header>

      <PacienteSelector paciente={b.paciente} onCambiar={(p) => setB({ ...b, paciente: p })} />

      <section className="tarjeta"><Diagnostico value={b.dx} onChange={(dx) => setB((x) => ({ ...x, dx }))} /></section>

      <section className="tarjeta flex flex-col gap-3">
        <span className="etiqueta">Medicamentos</span>
        {b.items.length === 0 && <p className="text-sm text-[var(--muted)] m-0">Agrega desde el catálogo; el esquema llena la indicación y la cantidad.</p>}
        {b.items.map((it, i) => (
          <div key={i} className="border border-[var(--line)] rounded-2xl p-3 flex flex-col gap-2 entrar">
            <div className="flex items-start gap-2">
              <div className="flex flex-col">
                <button className="bg-transparent border-0 cursor-pointer text-[var(--muted)] p-0.5" aria-label="Subir" onClick={() => mover(i, -1)}>▲</button>
                <button className="bg-transparent border-0 cursor-pointer text-[var(--muted)] p-0.5" aria-label="Bajar" onClick={() => mover(i, 1)}>▼</button>
              </div>
              <div className="flex-1"><b>{i + 1}. {it.generico}</b> <span className="text-[var(--muted)] text-sm">{it.presentacion}</span></div>
              <button className="btn !px-0 w-10 !min-h-10 btn-peligro" aria-label={`Quitar ${it.generico}`} onClick={() => quitar(i)}><Trash2 size={16} /></button>
            </div>
            <div className="campo"><label htmlFor={`ind${i}`}>Indicación</label><textarea id={`ind${i}`} className="input !min-h-[64px]" value={it.indicacion} onChange={(e) => setItem(i, 'indicacion', e.target.value)} /></div>
            <div className="campo"><label htmlFor={`can${i}`}>Cantidad</label><input id={`can${i}`} className="input" placeholder="#21 (veintiuno)" value={it.cantidad} onChange={(e) => setItem(i, 'cantidad', e.target.value)} /></div>
          </div>
        ))}
        <button className="btn btn-fantasma" onClick={() => setCatalogo(true)}>+ Agregar medicamento</button>
      </section>

      <section className="tarjeta campo">
        <label htmlFor="ig">Indicaciones generales</label>
        <textarea id="ig" className="input" placeholder="Líquidos abundantes. Control en 7 días o antes si empeora." value={b.indicaciones} onChange={(e) => setB({ ...b, indicaciones: e.target.value })} />
      </section>

      <OpcionesEmision op={op} setOp={setOp} />
      <BotonEmitir tipo="receta" paciente={b.paciente} op={op} contenido={contenido} valido={valido} onEmitido={limpiar} />
      {!valido && <p className="text-xs text-[var(--muted)] text-center m-0">Falta {!b.paciente ? 'elegir el paciente' : b.items.length === 0 ? 'agregar al menos un medicamento' : 'la indicación de algún medicamento'}.</p>}

      {catalogo && <Catalogo poblacionInicial={esNino ? 'Niño' : 'Adulto'} onCerrar={() => setCatalogo(false)}
        onAgregar={(it) => { setB((x) => ({ ...x, items: [...x.items, it] })); setCatalogo(false) }} />}
    </div>
  )
}
