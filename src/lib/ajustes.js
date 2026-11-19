import { useEffect, useState } from 'react'
import { supabase } from './supabase'

// Ajustes compartidos entre los médicos (se leen una vez por sesión)
let cache = null
const DEFECTO = { codigo_diagnostico: 'ambos', salud_examenes: ['Hemograma completo', 'Examen general de orina', 'Examen general de heces'] }

export async function cargarAjustes(forzar = false) {
  if (cache && !forzar) return cache
  const { data } = await supabase.from('ajustes').select('clave, valor')
  cache = { ...DEFECTO, ...Object.fromEntries((data || []).map((a) => [a.clave, a.valor])) }
  return cache
}
export function actualizarCacheAjuste(clave, valor) { if (cache) cache[clave] = valor }

export function useAjustes() {
  const [a, setA] = useState(cache || DEFECTO)
  useEffect(() => { cargarAjustes().then(setA) }, [])
  return a
}

// Texto del código según el ajuste guardado en el documento: 'ambos' | 'cie10' | 'cie11'
export function textoCodigo(dx, modo = 'ambos') {
  if (!dx) return ''
  const p = []
  if (modo !== 'cie11' && dx.cie10) p.push(`CIE-10 ${dx.cie10}`)
  if (modo !== 'cie10' && dx.cie11) p.push(`CIE-11 ${dx.cie11}`)
  return p.join(' · ')
}

// Compatibilidad con documentos guardados antes del buscador (diagnostico + cie10 sueltos)
export function dxDe(c) {
  if (c.dx) return c.dx
  if (c.diagnostico) return { nombre: c.diagnostico, cie10: c.cie10 || '', cie11: '' }
  return null
}
