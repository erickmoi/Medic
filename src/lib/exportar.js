import { supabase } from './supabase'
import { hoyISO } from './util'

// ---------- Word (.doc): copia el documento con sus estilos en línea ----------
async function imagenADataURL(img) {
  try {
    const r = await fetch(img.src); const b = await r.blob()
    return await new Promise((ok) => { const fr = new FileReader(); fr.onload = () => ok(fr.result); fr.readAsDataURL(b) })
  } catch { return img.src }
}

export async function exportarWord(nodo, nombre, medida) {
  const clon = nodo.cloneNode(true)
  const origen = nodo.querySelectorAll('*'), destino = clon.querySelectorAll('*')
  const props = ['font-family', 'font-size', 'font-weight', 'font-style', 'color', 'background-color', 'text-align', 'line-height',
    'padding-top', 'padding-right', 'padding-bottom', 'padding-left', 'margin-top', 'margin-bottom', 'border-top', 'border-right', 'border-bottom', 'border-left',
    'width', 'white-space', 'letter-spacing', 'text-transform', 'vertical-align', 'border-collapse']
  const copiar = (a, b) => { const cs = getComputedStyle(a); b.setAttribute('style', props.map((p) => `${p}:${cs.getPropertyValue(p)}`).join(';')) }
  copiar(nodo, clon)
  origen.forEach((el, i) => copiar(el, destino[i]))
  for (const img of clon.querySelectorAll('img')) img.src = await imagenADataURL(img)
  clon.style.height = 'auto'
  const html = `<!doctype html><html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word"><head><meta charset="utf-8">
<style>@page { size: ${medida}; margin: 1.5cm; } body { margin: 0; }</style></head><body>${clon.outerHTML}</body></html>`
  const a = document.createElement('a')
  a.href = URL.createObjectURL(new Blob(['﻿', html], { type: 'application/msword' }))
  a.download = nombre.replace(/\.pdf$/, '.doc'); a.click()
}

// ---------- Repetir un documento: arma el borrador del formulario ----------
export async function prepararRepeticion(doc) {
  const c = doc.contenido || {}
  const pid = doc.paciente_id
  const { data: paciente } = pid ? await supabase.from('pacientes').select('*').eq('id', pid).maybeSingle() : { data: null }
  const hoy = hoyISO()
  const b = { ...c, paciente }
  delete b.fecha; delete b.fecha_emision; delete b.codigo_modo
  if (doc.tipo === 'incapacidad') { b.fecha_evaluacion = hoy; b.desde = hoy }
  if (doc.tipo === 'salud') { b.fecha_evaluacion = hoy; b.labs = Object.fromEntries((c.laboratorios || []).map((l) => [l.nombre, l])) }
  if (doc.tipo === 'constancia') { b.fecha_consulta = hoy; b.con_dx = !!c.dx; b.hora_inicio = ''; b.hora_fin = '' }
  if (doc.tipo === 'defuncion') return null // un fallecido no se repite
  if (!b.dx && c.diagnostico) b.dx = { nombre: c.diagnostico, cie10: c.cie10 || '', cie11: '' }
  localStorage.setItem(`medic-borrador-${doc.tipo}`, JSON.stringify(b))
  return `/nuevo/${doc.tipo}`
}

// ---------- Respaldo completo en JSON ----------
export async function descargarRespaldo() {
  const tablas = ['pacientes', 'documentos', 'medicamentos', 'presentaciones', 'esquemas', 'diagnosticos', 'estudios', 'ajustes']
  const datos = { generado: new Date().toISOString(), app: 'Medic' }
  for (const t of tablas) {
    const { data, error } = await supabase.from(t).select('*').limit(10000)
    if (error) throw new Error(`${t}: ${error.message}`)
    datos[t] = data
  }
  const a = document.createElement('a')
  a.href = URL.createObjectURL(new Blob([JSON.stringify(datos, null, 2)], { type: 'application/json' }))
  a.download = `respaldo-medic-${hoyISO()}.json`; a.click()
  return Object.fromEntries(tablas.map((t) => [t, datos[t].length]))
}
