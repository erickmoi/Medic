import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import { AuthProvider } from './lib/auth.jsx'
import { ToastProvider } from './components/Toast.jsx'
import './styles.css'

// Tema guardado en el dispositivo: 'sistema' | 'claro' | 'oscuro'
const tema = localStorage.getItem('medic-tema') || 'sistema'
if (tema !== 'sistema') document.documentElement.dataset.tema = tema

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <App />
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
)
