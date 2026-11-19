import { NavLink, Navigate, Route, Routes } from 'react-router-dom'
import { Home, Users, History, UserRound } from 'lucide-react'
import { useAuth } from './lib/auth.jsx'
import Login from './pages/Login.jsx'
import Inicio from './pages/Inicio.jsx'
import Pacientes from './pages/Pacientes.jsx'
import Historial from './pages/Historial.jsx'
import Perfil from './pages/Perfil.jsx'
import NuevaReceta from './pages/NuevaReceta.jsx'
import NuevaIncapacidad from './pages/NuevaIncapacidad.jsx'
import Documento from './pages/Documento.jsx'

export default function App() {
  const { session, cuenta } = useAuth()

  if (session === undefined) return <Cargando />
  if (!session) return <Routes><Route path="*" element={<Login />} /></Routes>
  if (!cuenta) return <Cargando texto="Cargando tu perfil…" />

  return (
    <div className="app">
      <nav className="nav" aria-label="Principal">
        <NavLink to="/" end className={({ isActive }) => isActive ? 'activo' : ''}><Home size={22} aria-hidden="true" />Inicio</NavLink>
        <NavLink to="/pacientes" className={({ isActive }) => isActive ? 'activo' : ''}><Users size={22} aria-hidden="true" />Pacientes</NavLink>
        <NavLink to="/historial" className={({ isActive }) => isActive ? 'activo' : ''}><History size={22} aria-hidden="true" />Historial</NavLink>
        <NavLink to="/perfil" className={({ isActive }) => isActive ? 'activo' : ''}><UserRound size={22} aria-hidden="true" />Mi perfil</NavLink>
      </nav>
      <main className="contenido">
        <Routes>
          <Route path="/" element={<Inicio />} />
          <Route path="/pacientes" element={<Pacientes />} />
          <Route path="/historial" element={<Historial />} />
          <Route path="/perfil" element={<Perfil />} />
          <Route path="/nuevo/receta" element={<NuevaReceta />} />
          <Route path="/nuevo/incapacidad" element={<NuevaIncapacidad />} />
          <Route path="/documento/:id" element={<Documento />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  )
}

function Cargando({ texto = 'Cargando…' }) {
  return (
    <div className="min-h-dvh flex flex-col items-center justify-center gap-3">
      <span className="serif text-5xl text-[var(--accent)]">℞</span>
      <span className="text-[var(--muted)] text-sm">{texto}</span>
    </div>
  )
}
