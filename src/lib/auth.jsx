import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { supabase, rpc } from './supabase'

const AuthCtx = createContext(null)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(undefined) // undefined = cargando
  const [cuenta, setCuenta] = useState(null)

  const recargarCuenta = useCallback(async () => {
    try { setCuenta(await rpc('mi_cuenta')) } catch { setCuenta(null) }
  }, [])

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    // No se llama a Supabase dentro del callback: solo se guarda la sesión
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s))
    return () => sub.subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (session) recargarCuenta()
    else setCuenta(null)
  }, [session, recargarCuenta])

  const salir = () => supabase.auth.signOut()

  return (
    <AuthCtx.Provider value={{ session, cuenta, recargarCuenta, salir }}>
      {children}
    </AuthCtx.Provider>
  )
}

export const useAuth = () => useContext(AuthCtx)
