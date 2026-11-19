// Solo para vista previa local (no se publica): pantallas con datos de ejemplo
import ReactDOM from 'react-dom/client'
import { MemoryRouter } from 'react-router-dom'
import '../src/styles.css'
import { ToastProvider } from '../src/components/Toast.jsx'
import RecetaDoc from '../src/docs/RecetaDoc.jsx'
import IncapacidadDoc from '../src/docs/IncapacidadDoc.jsx'
import NuevaReceta from '../src/pages/NuevaReceta.jsx'
import NuevaIncapacidad from '../src/pages/NuevaIncapacidad.jsx'
import Login from '../src/pages/Login.jsx'

const v = new URLSearchParams(location.search).get('v')
if (new URLSearchParams(location.search).get('t') === 'oscuro') document.documentElement.dataset.tema = 'oscuro'
const medico = { iniciales: 'ED', titulo: 'Dr.', nombre: 'Erick Moisés Díaz Chica', profesion: 'Doctor en Medicina', especialidad: 'Medicina General', jvpm: '24508', ciudad: 'San Salvador', telefono: '[Teléfono]', correo_contacto: 'moises.diazzch@gmail.com', direccion: '[Dirección]' }
const pac = { id: 'x', nombre: 'Ana Lucía Pérez Rivas', fecha_nacimiento: '1992-03-10', sexo: 'F', peso_kg: 62, alergias: '' }
const receta = { codigo: 'R-0001', tamano: 'media_carta', con_firma: true, estado: 'emitido', contenido: { fecha: '2026-11-19', paciente: { nombre: pac.nombre, edad: '34 años', sexo: 'F', peso_kg: 62 }, diagnostico: 'Faringoamigdalitis bacteriana', cie10: 'J03.9',
  items: [ { generico: 'Amoxicilina', presentacion: '500 mg cápsula/tableta', cantidad: '#21 (veintiuno)', indicacion: 'Tomar 1 cápsula vía oral cada 8 horas por 7 días.' },
           { generico: 'Ibuprofeno', presentacion: '400 mg tableta', cantidad: '#15 (quince)', indicacion: 'Tomar 1 tableta vía oral cada 8 horas por 5 días.' } ], indicaciones: 'Líquidos abundantes. Control en 7 días o antes si empeora.' } }
const inc = { codigo: 'INC-0001', tamano: 'carta', con_firma: true, estado: 'emitido', contenido: { fecha_emision: '2026-11-19', fecha_evaluacion: '2026-11-19', paciente: { nombre: 'José Roberto Mejía Torres', edad: '22 años', sexo: 'M', dui: '00000000-0' }, diagnostico: 'Gastroenteritis aguda', cie10: 'A09', dias: 3, desde: '2026-11-19', hasta: '2026-11-21', reintegro: '2026-11-22' } }

if (v === 'receta-form') localStorage.setItem('medic-borrador-receta', JSON.stringify({ paciente: pac, diagnostico: 'Faringoamigdalitis bacteriana', cie10: 'J03.9', items: receta.contenido.items, indicaciones: '' }))
if (v === 'inc-form') localStorage.setItem('medic-borrador-incapacidad', JSON.stringify({ paciente: { ...pac, nombre: 'José Roberto Mejía Torres', sexo: 'M', fecha_nacimiento: '2004-02-01' }, fecha_evaluacion: '2026-11-19', diagnostico: 'Gastroenteritis aguda', cie10: 'A09', dias: 3, desde: '2026-11-19', isss: '' }))

const vistas = {
  'receta-doc': <div style={{ padding: 20, background: '#ddd' }}><RecetaDoc doc={receta} medico={medico} /></div>,
  'inc-doc': <div style={{ padding: 20, background: '#ddd' }}><IncapacidadDoc doc={inc} medico={medico} /></div>,
  'receta-form': <div className="contenido"><NuevaReceta /></div>,
  'inc-form': <div className="contenido"><NuevaIncapacidad /></div>,
  'login': <Login />,
}
ReactDOM.createRoot(document.getElementById('root')).render(<MemoryRouter><ToastProvider>{vistas[v]}</ToastProvider></MemoryRouter>)
