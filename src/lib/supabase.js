import { createClient } from '@supabase/supabase-js'

// La clave publicable está hecha para usarse en el navegador; la seguridad la dan RLS y las RPC.
const URL_SB = import.meta.env.VITE_SUPABASE_URL || 'https://iidfzqgsikfghuuhhdfc.supabase.co'
const KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_68GKGqLaeQQob4HUjW_81w_C_Tc5XZJ'

export const supabase = createClient(URL_SB, KEY,
  { auth: { persistSession: true, autoRefreshToken: true } }
)

// Llama una función RPC y lanza un Error legible si falla
export async function rpc(nombre, args) {
  const { data, error } = await supabase.rpc(nombre, args)
  if (error) throw new Error(error.message)
  return data
}

// URL temporal (1 h) de la firma o el sello guardados en el bucket privado
export async function urlFirmada(path) {
  if (!path) return null
  const { data, error } = await supabase.storage.from('firmas').createSignedUrl(path, 3600)
  if (error) return null
  return data.signedUrl
}
