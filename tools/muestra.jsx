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
import EstudiosDoc from '../src/docs/EstudiosDoc.jsx'
import SaludDoc from '../src/docs/SaludDoc.jsx'
import ConstanciaDoc from '../src/docs/ConstanciaDoc.jsx'
import DefuncionDoc from '../src/docs/DefuncionDoc.jsx'

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

const sara = { ...medico, iniciales: 'SC', titulo: 'Dra.', nombre: 'Sara Raquel Campos Sánchez', profesion: 'Doctora en Medicina', jvpm: '24509' }
const dxT = { nombre: 'Sospecha de tiroiditis de Hashimoto', cie10: 'E06.3', cie11: '5A03.20' }
const est = { codigo: 'EST-0001', tamano: 'media_carta', con_firma: true, estado: 'emitido', contenido: { fecha: '2026-11-19', codigo_modo: 'ambos', paciente: { nombre: 'Carmen Elena Ruiz Méndez', edad: '45 años', sexo: 'F' }, dx: dxT,
  estudios: [{ nombre: 'Hemograma completo', tipo: 'laboratorio' }, { nombre: 'TSH', tipo: 'laboratorio' }, { nombre: 'T4 libre', tipo: 'laboratorio' }, { nombre: 'Anticuerpos anti-TPO', tipo: 'laboratorio' }, { nombre: 'USG de tiroides', tipo: 'gabinete' }], indicaciones: 'Traer resultados a la consulta' } }
const sal = { codigo: 'SAL-0001', tamano: 'carta', con_firma: true, estado: 'emitido', contenido: { fecha_emision: '2026-11-19', fecha_evaluacion: '2026-11-19', paciente: { nombre: 'Daniela Sofía Flores Ramos', edad: '19 años', sexo: 'F', dui: '00000000-0' },
  signos: { pa: '110/70', fc: '72', fr: '16', temp: '36.6', peso: '58', talla: '1.62' }, laboratorios: [{ nombre: 'Hemograma completo', resultado: 'Dentro de límites normales', fecha: '2026-11-17' }, { nombre: 'Examen general de orina', resultado: 'Sin alteraciones', fecha: '2026-11-17' }, { nombre: 'Examen general de heces', resultado: 'No se observan parásitos', fecha: '2026-11-17' }],
  examen_fisico: 'Sin hallazgos patológicos.', conclusion: 'clínicamente sana y apta', apto_para: 'realizar actividades académicas', vigencia_dias: 30 } }
const con = { codigo: 'CON-0001', tamano: 'media_carta', con_firma: true, estado: 'emitido', contenido: { fecha_emision: '2026-11-19', fecha_consulta: '2026-11-19', hora_inicio: '08:00', hora_fin: '09:30', paciente: { nombre: 'Luis Alberto Ramírez', edad: '38 años', sexo: 'M', dui: '00000000-0' }, codigo_modo: 'ambos', dx: null, nota: 'Se recomienda reposo el resto del día.' } }
const def = { codigo: 'DEF-0001', tamano: 'carta', con_firma: true, estado: 'emitido', contenido: { codigo_modo: 'ambos', fallecido: { nombre: 'Manuel Antonio Guzmán Ríos', edad: '85 años', sexo: 'M', dui: '00000000-0' }, fecha_muerte: '2026-11-19', hora_muerte: '06:00',
  lugar: { tipo: 'Domicilio', detalle: 'Cantón Ojo de Agua', distrito: 'El Rosario', municipio: 'Morazán Norte', departamento: 'Morazán' },
  causas: { a: { nombre: 'Edema agudo de pulmón', cie10: 'J81', cie11: 'CB01' }, b: { nombre: 'Enfermedad renal crónica estadio 5', cie10: 'N18.5', cie11: 'GB61.5' }, c: null, ii: { nombre: 'Neumonía', cie10: 'J18.9', cie11: 'CA40.Z' } }, tipo_muerte: 'Natural',
  informante: { nombre: 'Rosa María Guzmán de López', parentesco: 'hija', edad: '54', dui: '00000000-0', residencia: 'Cantón Ojo de Agua, distrito El Rosario' }, fecha_emision: '2026-11-19', hora_emision: '06:30', emision_lugar: 'Morazán Norte, departamento de Morazán' } }

const vistas = {
  'est-doc': <div style={{ padding: 20, background: '#ddd' }}><EstudiosDoc doc={est} medico={sara} /></div>,
  'sal-doc': <div style={{ padding: 20, background: '#ddd' }}><SaludDoc doc={sal} medico={sara} /></div>,
  'con-doc': <div style={{ padding: 20, background: '#ddd' }}><ConstanciaDoc doc={con} medico={medico} /></div>,
  'def-doc': <div style={{ padding: 20, background: '#ddd' }}><DefuncionDoc doc={def} medico={medico} /></div>,
  'receta-doc': <div style={{ padding: 20, background: '#ddd' }}><RecetaDoc doc={receta} medico={medico} /></div>,
  'inc-doc': <div style={{ padding: 20, background: '#ddd' }}><IncapacidadDoc doc={inc} medico={medico} /></div>,
  'receta-form': <div className="contenido"><NuevaReceta /></div>,
  'inc-form': <div className="contenido"><NuevaIncapacidad /></div>,
  'login': <Login />,
}
ReactDOM.createRoot(document.getElementById('root')).render(<MemoryRouter><ToastProvider>{vistas[v]}</ToastProvider></MemoryRouter>)
