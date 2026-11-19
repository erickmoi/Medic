import { createContext, useCallback, useContext, useRef, useState } from 'react'

const ToastCtx = createContext(() => {})

// aviso('Texto') o aviso('Texto', { accion: 'Deshacer', alHacer: fn })
export function ToastProvider({ children }) {
  const [t, setT] = useState(null)
  const timer = useRef()
  const aviso = useCallback((texto, opts = {}) => {
    clearTimeout(timer.current)
    setT({ texto, ...opts, id: Date.now() })
    timer.current = setTimeout(() => setT(null), opts.ms || 3500)
  }, [])
  return (
    <ToastCtx.Provider value={aviso}>
      {children}
      {t && (
        <div className="toast" role="status" key={t.id}>
          <span>{t.texto}</span>
          {t.accion && <button onClick={() => { t.alHacer?.(); setT(null) }}>{t.accion}</button>}
        </div>
      )}
    </ToastCtx.Provider>
  )
}

export const useAviso = () => useContext(ToastCtx)
