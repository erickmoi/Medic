import { useState } from 'react'
import { supabase } from '../lib/supabase'

// Ingreso con correo y contraseña. Solo los correos autorizados pueden crear cuenta.
export default function Login() {
  const [modo, setModo] = useState('entrar') // entrar | crear | olvido
  const [email, setEmail] = useState(localStorage.getItem('medic-ultimo-correo') || '')
  const [pass, setPass] = useState('')
  const [ver, setVer] = useState(false)
  const [msg, setMsg] = useState(null)
  const [cargando, setCargando] = useState(false)

  async function enviar(e) {
    e.preventDefault()
    setMsg(null); setCargando(true)
    localStorage.setItem('medic-ultimo-correo', email)
    try {
      if (modo === 'entrar') {
        const { error } = await supabase.auth.signInWithPassword({ email, password: pass })
        if (error) throw new Error(error.message === 'Invalid login credentials' ? 'Correo o contraseña incorrectos.' : error.message)
      } else if (modo === 'crear') {
        const { error } = await supabase.auth.signUp({ email, password: pass, options: { emailRedirectTo: window.location.origin } })
        if (error) throw new Error(/autorizado|Database error/i.test(error.message) ? 'Este correo no está autorizado para usar la app.' : error.message)
        setMsg({ ok: true, t: 'Listo. Revisa tu correo para confirmar la cuenta y luego entra.' })
        setModo('entrar')
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin + '/perfil' })
        if (error) throw new Error(error.message)
        setMsg({ ok: true, t: 'Te enviamos un enlace para cambiar la contraseña.' })
      }
    } catch (err) {
      setMsg({ ok: false, t: err.message })
    } finally { setCargando(false) }
  }

  return (
    <div className="min-h-dvh flex items-center justify-center p-5">
      <form onSubmit={enviar} className="tarjeta entrar w-full max-w-sm flex flex-col gap-4 !p-6">
        <div className="flex flex-col items-center gap-1 mb-2">
          <span className="serif text-6xl text-[var(--accent)] leading-none">℞</span>
          <h1 className="titulo text-center">Medic</h1>
          <span className="text-sm text-[var(--muted)]">Formatos médicos · Dr. Díaz y Dra. Campos</span>
        </div>
        <div className="segmentado" role="tablist">
          <button type="button" className={modo === 'entrar' ? 'activo' : ''} onClick={() => setModo('entrar')}>Entrar</button>
          <button type="button" className={modo === 'crear' ? 'activo' : ''} onClick={() => setModo('crear')}>Crear cuenta</button>
        </div>
        <div className="campo">
          <label htmlFor="email">Correo</label>
          <input id="email" className="input" type="email" autoComplete="email" inputMode="email" required value={email} onChange={(e) => setEmail(e.target.value.trim())} />
        </div>
        {modo !== 'olvido' && (
          <div className="campo">
            <label htmlFor="pass">Contraseña {modo === 'crear' && <span>(mínimo 8 caracteres)</span>}</label>
            <div className="flex gap-2">
              <input id="pass" className="input" type={ver ? 'text' : 'password'} minLength={modo === 'crear' ? 8 : undefined}
                autoComplete={modo === 'crear' ? 'new-password' : 'current-password'} required value={pass} onChange={(e) => setPass(e.target.value)} />
              <button type="button" className="btn !px-3 text-sm" onClick={() => setVer(!ver)}>{ver ? 'Ocultar' : 'Ver'}</button>
            </div>
          </div>
        )}
        {msg && <p className={`text-sm m-0 p-3 rounded-xl ${msg.ok ? 'bg-[var(--accent-soft)]' : 'bg-[var(--danger-soft)] text-[var(--danger)]'}`} role="alert">{msg.t}</p>}
        <button className="btn btn-primario" disabled={cargando}>
          {cargando ? 'Un momento…' : modo === 'entrar' ? 'Entrar' : modo === 'crear' ? 'Crear mi cuenta' : 'Enviar enlace'}
        </button>
        <button type="button" className="text-sm text-[var(--accent)] bg-transparent border-0 cursor-pointer min-h-11"
          onClick={() => { setModo(modo === 'olvido' ? 'entrar' : 'olvido'); setMsg(null) }}>
          {modo === 'olvido' ? 'Volver a entrar' : 'Olvidé mi contraseña'}
        </button>
      </form>
    </div>
  )
}
