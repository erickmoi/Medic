import { useEffect, useRef, useState } from 'react'
import Hoja from './Hoja.jsx'

// Editor para logo, firma o sello: quita el fondo (color de las esquinas), recorta bordes y reduce tamaño.
// onGuardar(blobPNG)
export default function EditorImagen({ archivo, titulo, onCerrar, onGuardar }) {
  const [img, setImg] = useState(null)
  const [tolerancia, setTolerancia] = useState(28)
  const [quitarFondo, setQuitarFondo] = useState(true)
  const [recortar, setRecortar] = useState(true)
  const [tinta, setTinta] = useState(false) // fuerza trazos oscuros a un color uniforme (útil para firmas)
  const lienzo = useRef(null)
  const [guardando, setGuardando] = useState(false)

  const [error, setError] = useState(null)
  // Se lee el archivo como dataURL (más confiable en Safari de iPhone que una URL temporal)
  useEffect(() => {
    let vivo = true
    setImg(null); setError(null)
    const fr = new FileReader()
    fr.onload = () => {
      const i = new Image()
      i.onload = () => vivo && setImg(i)
      i.onerror = () => vivo && setError('No se pudo abrir la imagen. Si es una foto HEIC, compártela como JPG o PNG e intenta de nuevo.')
      i.src = fr.result
    }
    fr.onerror = () => vivo && setError('No se pudo leer el archivo. Intenta elegirlo de nuevo.')
    fr.readAsDataURL(archivo)
    return () => { vivo = false }
  }, [archivo])

  useEffect(() => {
    if (!img || !lienzo.current) return
    const max = 700
    const k = Math.min(1, max / Math.max(img.width, img.height))
    const w = Math.round(img.width * k), h = Math.round(img.height * k)
    const tmp = document.createElement('canvas'); tmp.width = w; tmp.height = h
    const cx = tmp.getContext('2d', { willReadFrequently: true })
    cx.drawImage(img, 0, 0, w, h)
    const d = cx.getImageData(0, 0, w, h); const p = d.data
    // Color de fondo = promedio de las 4 esquinas
    const esq = [[0, 0], [w - 1, 0], [0, h - 1], [w - 1, h - 1]].map(([x, y]) => { const o = (y * w + x) * 4; return [p[o], p[o + 1], p[o + 2]] })
    const bg = [0, 1, 2].map((c) => esq.reduce((s, e) => s + e[c], 0) / 4)
    const lim = (tolerancia / 100) * 255 * 1.2
    let minX = w, minY = h, maxX = 0, maxY = 0
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const o = (y * w + x) * 4
      if (quitarFondo) {
        const dist = Math.hypot(p[o] - bg[0], p[o + 1] - bg[1], p[o + 2] - bg[2])
        if (dist < lim) p[o + 3] = 0
        else if (dist < lim * 1.5) p[o + 3] = Math.round(p[o + 3] * ((dist - lim) / (lim * 0.5))) // borde suave
      }
      if (tinta && p[o + 3] > 0) { p[o] = 30; p[o + 1] = 40; p[o + 2] = 120 }
      if (p[o + 3] > 20) { if (x < minX) minX = x; if (x > maxX) maxX = x; if (y < minY) minY = y; if (y > maxY) maxY = y }
    }
    cx.putImageData(d, 0, 0)
    const c = lienzo.current
    if (recortar && maxX > minX && maxY > minY) {
      const m = 6, sx = Math.max(0, minX - m), sy = Math.max(0, minY - m)
      const sw = Math.min(w - sx, maxX - minX + 2 * m), sh = Math.min(h - sy, maxY - minY + 2 * m)
      c.width = sw; c.height = sh; c.getContext('2d').drawImage(tmp, sx, sy, sw, sh, 0, 0, sw, sh)
    } else { c.width = w; c.height = h; c.getContext('2d').drawImage(tmp, 0, 0) }
  }, [img, tolerancia, quitarFondo, recortar, tinta])

  function guardar() {
    setGuardando(true)
    lienzo.current.toBlob((b) => {
      setGuardando(false)
      if (!b) { setError('No se pudo procesar la imagen. Intenta con otra foto.'); return }
      onGuardar(b)
    }, 'image/png')
  }

  return (
    <Hoja titulo={titulo} onCerrar={onCerrar}
      pie={<button className="btn btn-primario w-full" disabled={!img || guardando} onClick={guardar}>{guardando ? 'Guardando…' : 'Guardar imagen'}</button>}>
      <div className="flex flex-col gap-4">
        {error && <p className="m-0 text-sm p-3 rounded-xl bg-[var(--danger-soft)] text-[var(--danger)]" role="alert">{error}</p>}
        {!img && !error && <div className="esqueleto h-[180px]" />}
        <div className={`rounded-2xl border border-[var(--line)] p-4 flex items-center justify-center min-h-[180px] ${img ? '' : 'hidden'}`}
          style={{ backgroundImage: 'conic-gradient(#e5e7eb 25%, #fff 0 50%, #e5e7eb 0 75%, #fff 0)', backgroundSize: '18px 18px' }}>
          <canvas ref={lienzo} className="max-w-full max-h-[240px]" aria-label="Vista previa de la imagen editada" />
        </div>
        <div className="flex justify-between items-center"><span className="text-sm font-semibold">Quitar fondo</span>
          <button role="switch" aria-checked={quitarFondo} aria-label="Quitar fondo" className="interruptor" onClick={() => setQuitarFondo(!quitarFondo)} /></div>
        {quitarFondo && (
          <div className="campo"><label htmlFor="tol">Intensidad ({tolerancia})</label>
            <input id="tol" type="range" min="5" max="70" value={tolerancia} onChange={(e) => setTolerancia(Number(e.target.value))} className="w-full accent-[var(--accent)]" /></div>
        )}
        <div className="flex justify-between items-center"><span className="text-sm font-semibold">Recortar bordes vacíos</span>
          <button role="switch" aria-checked={recortar} aria-label="Recortar bordes" className="interruptor" onClick={() => setRecortar(!recortar)} /></div>
        <div className="flex justify-between items-center"><span className="text-sm font-semibold">Tinta azul uniforme <span className="font-normal text-[var(--muted)]">(firmas)</span></span>
          <button role="switch" aria-checked={tinta} aria-label="Tinta azul uniforme" className="interruptor" onClick={() => setTinta(!tinta)} /></div>
        <p className="text-xs text-[var(--muted)] m-0">Funciona mejor con fotos sobre fondo liso (papel blanco). Si se borra parte del trazo, baja la intensidad.</p>
      </div>
    </Hoja>
  )
}
