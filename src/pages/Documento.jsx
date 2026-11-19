import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ChevronLeft, Download, Printer, Share2, Ban } from 'lucide-react'
import { supabase, rpc } from '../lib/supabase'
import { useAuth } from '../lib/auth.jsx'
import { useAviso } from '../components/Toast.jsx'
import Hoja from '../components/Hoja.jsx'
import RecetaDoc from '../docs/RecetaDoc.jsx'
import IncapacidadDoc from '../docs/IncapacidadDoc.jsx'
import EstudiosDoc from '../docs/EstudiosDoc.jsx'
import SaludDoc from '../docs/SaludDoc.jsx'
import ConstanciaDoc from '../docs/ConstanciaDoc.jsx'
import DefuncionDoc from '../docs/DefuncionDoc.jsx'
import { TIPOS, fechaHumana, hoyISO } from '../lib/util'

const VISTAS = { receta: RecetaDoc, incapacidad: IncapacidadDoc, estudios: EstudiosDoc, salud: SaludDoc, constancia: ConstanciaDoc, defuncion: DefuncionDoc }
const MEDIDAS = { carta: { w: 816, h: 1056, page: '8.5in 11in', pdf: 'letter' }, media_carta: { w: 528, h: 816, page: '5.5in 8.5in', pdf: [139.7, 215.9] } }

export default function Documento() {
  const { id } = useParams()
  const { cuenta } = useAuth()
  const aviso = useAviso()
  const [doc, setDoc] = useState(null)
  const [medico, setMedico] = useState(null)
  const [error, setError] = useState(null)
  const [anular, setAnular] = useState(false)
  const [motivo, setMotivo] = useState('')
  const [ocupado, setOcupado] = useState(false)
  const marco = useRef(null)
  const imprimible = useRef(null)
  const [escala, setEscala] = useState(1)

  async function cargar() {
    const { data, error } = await supabase.from('documentos').select('*').eq('id', id).maybeSingle()
    if (error || !data) { setError('No se encontró el documento.'); return }
    const { data: m } = await supabase.from('medicos').select('*').eq('id', data.medico_id).single()
    setDoc(data); setMedico(m)
  }
  useEffect(() => { cargar() }, [id])

  useLayoutEffect(() => {
    if (!doc || !marco.current) return
    const ajustar = () => setEscala(Math.min(1, (marco.current.clientWidth - 32) / MEDIDAS[doc.tamano].w))
    ajustar()
    const ro = new ResizeObserver(ajustar); ro.observe(marco.current)
    return () => ro.disconnect()
  }, [doc])

  if (error) return <p className="text-[var(--muted)]">{error} <Link to="/">Volver al inicio</Link></p>
  if (!doc || !medico) return <div className="esqueleto h-[70dvh]" />

  const Vista = VISTAS[doc.tipo]
  const med = MEDIDAS[doc.tamano]
  const propio = doc.medico_id === cuenta.id
  const nombreArchivo = `${doc.codigo} ${doc.contenido?.paciente?.nombre || doc.contenido?.fallecido?.nombre || ''}`.trim().replace(/\s+/g, '_') + '.pdf'

  async function generarPDF() {
    const html2pdf = (await import('html2pdf.js')).default
    return html2pdf().set({
      margin: 0, filename: nombreArchivo, image: { type: 'jpeg', quality: 0.96 },
      html2canvas: { scale: 2.5, useCORS: true, backgroundColor: '#ffffff' },
      jsPDF: { unit: 'mm', format: med.pdf, orientation: 'portrait' },
    }).from(imprimible.current.firstChild)
  }
  async function descargar() {
    setOcupado(true)
    try { await (await generarPDF()).save() } catch { aviso('No se pudo generar el PDF') } finally { setOcupado(false) }
  }
  async function compartir() {
    setOcupado(true)
    try {
      const blob = await (await generarPDF()).outputPdf('blob')
      const file = new File([blob], nombreArchivo, { type: 'application/pdf' })
      if (navigator.canShare?.({ files: [file] })) await navigator.share({ files: [file], title: doc.codigo })
      else { await (await generarPDF()).save(); aviso('Tu navegador no permite compartir archivos; se descargó el PDF') }
    } catch (e) { if (e.name !== 'AbortError') aviso('No se pudo compartir') } finally { setOcupado(false) }
  }
  function imprimir() {
    const st = document.createElement('style')
    st.textContent = `@page { size: ${med.page}; margin: 0 }`
    document.head.appendChild(st)
    window.print()
    setTimeout(() => st.remove(), 1000)
  }
  async function confirmarAnular() {
    try { setDoc(await rpc('anular_documento', { p_id: doc.id, p_motivo: motivo })); setAnular(false); aviso('Documento anulado') }
    catch (e) { aviso(e.message) }
  }
  async function homologar() {
    const nuevo = !doc.homologado
    try { setDoc(await rpc('marcar_homologado', { p_id: doc.id, p_homologado: nuevo, p_fecha: hoyISO() })); aviso(nuevo ? 'Marcado como homologado' : 'Homologación quitada') }
    catch (e) { aviso(e.message) }
  }

  return (
    <div className="flex flex-col gap-4 entrar">
      <header className="flex items-center gap-3">
        <Link to="/historial" className="btn !px-0 w-11" aria-label="Volver"><ChevronLeft size={20} /></Link>
        <div className="flex flex-col flex-1 min-w-0">
          <h1 className="titulo !text-[28px] truncate">{TIPOS[doc.tipo].nombre}</h1>
          <span className="text-xs text-[var(--muted)]"><span className="mono">{doc.codigo}</span> · {fechaHumana(doc.emitido_en)}{!propio && ` · ${medico.titulo} ${medico.nombre}`}</span>
        </div>
        {doc.estado === 'anulado' && <span className="insignia peligro">Anulado</span>}
      </header>

      <div className="grid grid-cols-3 gap-2">
        <button className="btn btn-primario" disabled={ocupado} onClick={descargar}><Download size={18} aria-hidden="true" />PDF</button>
        <button className="btn" onClick={imprimir}><Printer size={18} aria-hidden="true" />Imprimir</button>
        <button className="btn" disabled={ocupado} onClick={compartir}><Share2 size={18} aria-hidden="true" />Compartir</button>
      </div>
      {!propio && doc.con_firma && <p className="text-xs text-[var(--muted)] m-0">La firma y el sello solo se muestran al médico que emitió el documento.</p>}

      <div className="doc-marco" ref={marco} style={{ height: med.h * escala + 32 }}>
        <div style={{ transform: `scale(${escala})`, transformOrigin: 'top left', width: med.w, marginLeft: Math.max(0, ((marco.current?.clientWidth || 0) - 32 - med.w * escala) / 2) }}>
          {Vista ? <Vista doc={doc} medico={medico} /> : <p>Vista no disponible.</p>}
        </div>
      </div>

      {/* Copia a tamaño real para imprimir y generar el PDF */}
      <div ref={imprimible} className="imprimible" style={{ position: 'fixed', left: -10000, top: 0 }} aria-hidden="true">
        {Vista && <Vista doc={doc} medico={medico} />}
      </div>

      <section className="tarjeta flex flex-col gap-3">
        {['incapacidad', 'defuncion'].includes(doc.tipo) && (
          <div className="flex justify-between items-center gap-3">
            <div className="flex flex-col"><span className="font-semibold text-sm">{doc.tipo === 'defuncion' ? 'Asentada en el Registro del Estado Familiar' : 'Homologada en el ISSS'}</span>
              <span className="text-xs text-[var(--muted)]">{doc.homologado ? `Desde ${doc.homologado_fecha}` : 'Pendiente'}</span></div>
            <button role="switch" aria-checked={doc.homologado} aria-label="Homologada" className="interruptor" onClick={homologar} />
          </div>
        )}
        {propio && doc.estado === 'emitido' && <button className="btn btn-peligro" onClick={() => setAnular(true)}><Ban size={18} aria-hidden="true" />Anular documento</button>}
        {doc.estado === 'anulado' && doc.anulado_motivo && <p className="text-sm m-0">Motivo de anulación: {doc.anulado_motivo}</p>}
      </section>

      {anular && (
        <Hoja titulo="Anular documento" onCerrar={() => setAnular(false)}
          pie={<button className="btn btn-primario w-full !bg-[var(--danger)]" onClick={confirmarAnular}>Anular {doc.codigo}</button>}>
          <p className="text-sm text-[var(--muted)] mt-0">El documento queda en el historial marcado como ANULADO y su número no se vuelve a usar. Esto no se puede deshacer.</p>
          <div className="campo"><label htmlFor="mot">Motivo</label><input id="mot" className="input" value={motivo} onChange={(e) => setMotivo(e.target.value)} placeholder="Ej.: error en la dosis" autoFocus /></div>
        </Hoja>
      )}
    </div>
  )
}
