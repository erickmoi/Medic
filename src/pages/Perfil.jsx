import { useEffect, useState } from 'react'
import { LogOut, Upload } from 'lucide-react'
import { supabase, rpc, urlFirmada } from '../lib/supabase'
import { useAuth } from '../lib/auth.jsx'
import { useAviso } from '../components/Toast.jsx'
import { cargarAjustes, actualizarCacheAjuste } from '../lib/ajustes'

const VERSION = '0.2.0'

export default function Perfil() {
  const { cuenta, recargarCuenta, salir } = useAuth()
  const aviso = useAviso()
  const [f, setF] = useState({ telefono: cuenta.telefono || '', correo_contacto: cuenta.correo_contacto || '', direccion: cuenta.direccion || '', ciudad: cuenta.ciudad || 'San Salvador' })
  const [img, setImg] = useState({ firma: null, sello: null })
  const [tema, setTema] = useState(localStorage.getItem('medic-tema') || 'sistema')
  const [labs, setLabs] = useState([])
  const [salud, setSalud] = useState([])
  const [pass, setPass] = useState('')
  const [codigo, setCodigo] = useState('ambos')
  useEffect(() => { cargarAjustes(true).then((a) => setCodigo(a.codigo_diagnostico)) }, [])
  async function cambiarCodigo(v) {
    setCodigo(v)
    try { await rpc('guardar_ajuste', { p_clave: 'codigo_diagnostico', p_valor: v }); actualizarCacheAjuste('codigo_diagnostico', v); aviso('Código de diagnóstico actualizado') } catch (e) { aviso(e.message) }
  }

  useEffect(() => {
    Promise.all([urlFirmada(cuenta.firma_path), urlFirmada(cuenta.sello_path)]).then(([firma, sello]) => setImg({ firma, sello }))
  }, [cuenta.firma_path, cuenta.sello_path])
  useEffect(() => {
    supabase.from('estudios').select('nombre,grupo').eq('tipo', 'laboratorio').order('grupo').then(({ data }) => setLabs(data || []))
    supabase.from('ajustes').select('valor').eq('clave', 'salud_examenes').maybeSingle().then(({ data }) => setSalud(data?.valor || []))
  }, [])

  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })
  async function guardar() {
    try { await rpc('actualizar_mi_perfil', { p: f }); await recargarCuenta(); aviso('Datos guardados') } catch (e) { aviso(e.message) }
  }
  async function subir(tipo, archivo) {
    if (!archivo) return
    if (archivo.size > 1024 * 1024) { aviso('La imagen debe pesar menos de 1 MB'); return }
    const ext = archivo.type === 'image/png' ? 'png' : archivo.type === 'image/webp' ? 'webp' : 'jpg'
    const path = `${cuenta.id}/${tipo}-${Date.now()}.${ext}`
    const { error } = await supabase.storage.from('firmas').upload(path, archivo, { upsert: true, contentType: archivo.type })
    if (error) { aviso(error.message); return }
    const viejo = cuenta[`${tipo}_path`]
    await rpc('actualizar_mi_perfil', { p: { [`${tipo}_path`]: path } })
    if (viejo) supabase.storage.from('firmas').remove([viejo])
    await recargarCuenta(); aviso(tipo === 'firma' ? 'Firma actualizada' : 'Sello actualizado')
  }
  function cambiarTema(t) {
    setTema(t); localStorage.setItem('medic-tema', t)
    if (t === 'sistema') delete document.documentElement.dataset.tema
    else document.documentElement.dataset.tema = t
  }
  async function toggleExamen(n) {
    const nuevo = salud.includes(n) ? salud.filter((x) => x !== n) : [...salud, n]
    setSalud(nuevo)
    try { await rpc('guardar_ajuste', { p_clave: 'salud_examenes', p_valor: nuevo }); actualizarCacheAjuste('salud_examenes', nuevo) } catch (e) { aviso(e.message) }
  }
  async function cambiarPass() {
    const { error } = await supabase.auth.updateUser({ password: pass })
    if (error) aviso(error.message); else { setPass(''); aviso('Contraseña actualizada') }
  }

  const grupos = [...new Set(labs.map((l) => l.grupo))]
  return (
    <div className="flex flex-col gap-4 entrar">
      <h1 className="titulo">Mi perfil</h1>

      <section className="tarjeta flex flex-col gap-1">
        <span className="serif text-2xl">{cuenta.titulo} {cuenta.nombre}</span>
        <span className="text-sm text-[var(--muted)]">{cuenta.profesion} · {cuenta.especialidad} · J.V.P.M. {cuenta.jvpm}</span>
        <span className="text-xs text-[var(--muted)]">{cuenta.email}</span>
      </section>

      <section className="tarjeta grid grid-cols-2 gap-3">
        <span className="etiqueta col-span-2">Datos que salen en el pie de página</span>
        <div className="campo"><label htmlFor="tel">Teléfono</label><input id="tel" className="input" inputMode="tel" value={f.telefono} onChange={set('telefono')} /></div>
        <div className="campo"><label htmlFor="cor">Correo de contacto</label><input id="cor" className="input" type="email" value={f.correo_contacto} onChange={set('correo_contacto')} /></div>
        <div className="campo col-span-2"><label htmlFor="dir">Dirección</label><input id="dir" className="input" value={f.direccion} onChange={set('direccion')} /></div>
        <div className="campo col-span-2"><label htmlFor="ciu">Ciudad</label><input id="ciu" className="input" value={f.ciudad} onChange={set('ciudad')} /></div>
        <button className="btn btn-primario col-span-2" onClick={guardar}>Guardar datos</button>
      </section>

      <section className="tarjeta flex flex-col gap-3">
        <span className="etiqueta">Firma y sello digital</span>
        <p className="text-xs text-[var(--muted)] m-0">Usa una foto en PNG con fondo blanco o transparente. Solo tú puedes verlas; se guardan en un espacio privado.</p>
        <div className="grid grid-cols-2 gap-3">
          {['firma', 'sello'].map((t) => (
            <label key={t} className="border border-dashed border-[var(--line)] rounded-2xl p-3 flex flex-col items-center gap-2 cursor-pointer min-h-[120px] justify-center bg-white">
              {img[t] ? <img src={img[t]} alt={t} className="max-h-20 max-w-full" /> : <Upload size={22} color="#5C6670" aria-hidden="true" />}
              <span className="text-sm font-semibold text-[#16191C] capitalize">{img[t] ? `Cambiar ${t}` : `Subir ${t}`}</span>
              <input type="file" accept="image/png,image/jpeg,image/webp" className="sr-only" onChange={(e) => subir(t, e.target.files[0])} />
            </label>
          ))}
        </div>
      </section>

      <section className="tarjeta flex flex-col gap-3">
        <span className="etiqueta">Apariencia</span>
        <div className="segmentado">
          {[['sistema', 'Sistema'], ['claro', 'Claro'], ['oscuro', 'Oscuro']].map(([k, t]) => <button key={k} className={tema === k ? 'activo' : ''} onClick={() => cambiarTema(k)}>{t}</button>)}
        </div>
      </section>

      <section className="tarjeta flex flex-col gap-3">
        <span className="etiqueta">Código de diagnóstico en los documentos</span>
        <div className="segmentado">{[['ambos', 'Ambos'], ['cie10', 'CIE-10'], ['cie11', 'CIE-11']].map(([k, t]) => <button key={k} className={codigo === k ? 'activo' : ''} onClick={() => cambiarCodigo(k)}>{t}</button>)}</div>
        <p className="text-xs text-[var(--muted)] m-0">Aplica a los documentos nuevos; los ya emitidos conservan el código con que salieron. Se comparte entre tú y Sara.</p>
      </section>

      <section className="tarjeta flex flex-col gap-3">
        <span className="etiqueta">Exámenes en el certificado de salud</span>
        <p className="text-xs text-[var(--muted)] m-0">Los marcados aparecen para llenar sus resultados. Se comparte entre tú y Sara.</p>
        {grupos.map((g) => (
          <div key={g} className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-[var(--muted)]">{g}</span>
            <div className="flex flex-wrap gap-2">
              {labs.filter((l) => l.grupo === g).map((l) => <button key={l.nombre} className={`chip ${salud.includes(l.nombre) ? 'activo' : ''}`} aria-pressed={salud.includes(l.nombre)} onClick={() => toggleExamen(l.nombre)}>{l.nombre}</button>)}
            </div>
          </div>
        ))}
      </section>

      <section className="tarjeta flex flex-col gap-3">
        <span className="etiqueta">Seguridad</span>
        <div className="flex gap-2">
          <input className="input" type="password" autoComplete="new-password" placeholder="Nueva contraseña (mín. 8)" aria-label="Nueva contraseña" value={pass} onChange={(e) => setPass(e.target.value)} />
          <button className="btn" disabled={pass.length < 8} onClick={cambiarPass}>Cambiar</button>
        </div>
        <button className="btn btn-peligro" onClick={salir}><LogOut size={18} aria-hidden="true" />Cerrar sesión</button>
      </section>
      <p className="text-center text-xs text-[var(--muted)]">Medic v{VERSION}</p>
    </div>
  )
}
