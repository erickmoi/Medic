// Utilidades de formato en español (zona America/El_Salvador)
export const TZ = 'America/El_Salvador'

export const hoyISO = () => new Date().toLocaleDateString('en-CA', { timeZone: TZ })

export function fechaCorta(iso) {
  if (!iso) return ''
  const [y, m, d] = iso.slice(0, 10).split('-')
  return `${d}/${m}/${y}`
}

export function fechaLarga(iso) {
  if (!iso) return ''
  const d = new Date(iso.slice(0, 10) + 'T12:00:00')
  return d.toLocaleDateString('es-SV', { day: 'numeric', month: 'long', year: 'numeric' })
}

export function fechaHumana(ts) {
  const d = new Date(ts)
  return d.toLocaleString('es-SV', { timeZone: TZ, weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
}

export function sumarDias(iso, n) {
  const d = new Date(iso + 'T12:00:00')
  d.setDate(d.getDate() + n)
  return d.toISOString().slice(0, 10)
}

export function diaSemana(iso) {
  return new Date(iso + 'T12:00:00').toLocaleDateString('es-SV', { weekday: 'long' })
}

export function edad(fechaNac, ref = hoyISO()) {
  if (!fechaNac) return null
  const a = new Date(fechaNac + 'T12:00:00'), b = new Date(ref + 'T12:00:00')
  let años = b.getFullYear() - a.getFullYear()
  const m = b.getMonth() - a.getMonth()
  if (m < 0 || (m === 0 && b.getDate() < a.getDate())) años--
  if (años >= 2) return `${años} años`
  const meses = (b.getFullYear() - a.getFullYear()) * 12 + (b.getMonth() - a.getMonth()) - (b.getDate() < a.getDate() ? 1 : 0)
  return meses === 1 ? '1 mes' : `${meses} meses`
}

// ---------- Números en letras (0 a 9999) ----------
const U = ['cero','uno','dos','tres','cuatro','cinco','seis','siete','ocho','nueve','diez','once','doce','trece','catorce','quince','dieciséis','diecisiete','dieciocho','diecinueve','veinte','veintiuno','veintidós','veintitrés','veinticuatro','veinticinco','veintiséis','veintisiete','veintiocho','veintinueve']
const D = ['', '', '', 'treinta','cuarenta','cincuenta','sesenta','setenta','ochenta','noventa']
const C = ['', 'ciento','doscientos','trescientos','cuatrocientos','quinientos','seiscientos','setecientos','ochocientos','novecientos']

export function numALetras(n) {
  n = Math.floor(Number(n))
  if (!Number.isFinite(n) || n < 0) return ''
  if (n < 30) return U[n]
  if (n < 100) { const d = Math.floor(n / 10), u = n % 10; return D[d] + (u ? ' y ' + U[u] : '') }
  if (n === 100) return 'cien'
  if (n < 1000) { const c = Math.floor(n / 100), r = n % 100; return C[c] + (r ? ' ' + numALetras(r) : '') }
  if (n < 10000) { const m = Math.floor(n / 1000), r = n % 1000; return (m === 1 ? 'mil' : numALetras(m) + ' mil') + (r ? ' ' + numALetras(r) : '') }
  return String(n)
}

// "a los diecinueve días del mes de noviembre de dos mil veintiséis"
export function fechaEnLetras(iso) {
  const d = new Date(iso.slice(0, 10) + 'T12:00:00')
  const dia = d.getDate()
  const mes = d.toLocaleDateString('es-SV', { month: 'long' })
  const diaTxt = dia === 1 ? 'al primer día' : `a los ${numALetras(dia)} días`
  return `${diaTxt} del mes de ${mes} de ${numALetras(d.getFullYear())}`
}

export function cantidadEsquema(e) {
  if (e.cantidad_texto) return e.cantidad_texto
  if (e.dosis && e.tomas_dia && e.dias) {
    const n = Math.round(e.dosis * e.tomas_dia * e.dias)
    return `#${n} (${numALetras(n)})`
  }
  return ''
}

export function indicacionEsquema(e) {
  const partes = []
  if (e.dosis) partes.push(`${verboVia(e.via)} ${fmtNum(e.dosis)} ${e.unidad || ''}`.trim())
  else if (e.unidad) partes.push(`${verboVia(e.via)} ${e.unidad}`)
  if (e.via) partes.push(viaTexto(e.via))
  if (e.frecuencia) partes.push(e.frecuencia.replace(/^c\//, 'cada ').replace(' h', ' horas'))
  if (e.dias && e.frecuencia !== 'Dosis única') partes.push(`por ${fmtNum(e.dias)} ${e.dias == 1 ? 'día' : 'días'}`)
  return capital(partes.join(' ')) + '.'
}

const fmtNum = (n) => Number(n).toLocaleString('es-SV', { maximumFractionDigits: 2 })
const capital = (s) => s.charAt(0).toUpperCase() + s.slice(1)
function verboVia(via = '') {
  if (/oft|nasal/i.test(via)) return 'aplicar'
  if (/vaginal|t[oó]pica/i.test(via)) return 'aplicar'
  if (/IM|IV/.test(via)) return 'aplicar'
  return 'tomar'
}
function viaTexto(via) {
  const m = { VO: 'vía oral', IM: 'vía intramuscular', 'IM glútea': 'vía intramuscular glútea', Nasal: 'vía nasal', Vaginal: 'vía vaginal', 'Oftálmica': 'en el ojo afectado' }
  return m[via] || via
}

export const TIPOS = {
  receta:      { nombre: 'Receta',              prefijo: 'R' },
  estudios:    { nombre: 'Solicitud de estudios', prefijo: 'EST' },
  incapacidad: { nombre: 'Incapacidad',         prefijo: 'INC' },
  constancia:  { nombre: 'Constancia',          prefijo: 'CON' },
  salud:       { nombre: 'Certificado de salud', prefijo: 'SAL' },
  defuncion:   { nombre: 'Defunción',           prefijo: 'DEF' },
}
