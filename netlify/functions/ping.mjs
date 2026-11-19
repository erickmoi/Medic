// Función programada: llama una vez al día a Supabase para que el proyecto gratuito no se pause.
const URL_SB = process.env.VITE_SUPABASE_URL || 'https://iidfzqgsikfghuuhhdfc.supabase.co'
const KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_68GKGqLaeQQob4HUjW_81w_C_Tc5XZJ'

export default async () => {
  const r = await fetch(`${URL_SB}/rest/v1/rpc/ping`, {
    method: 'POST',
    headers: { apikey: KEY, 'Content-Type': 'application/json' },
    body: '{}',
  })
  console.log('ping supabase', r.status, await r.text())
  return new Response('ok')
}

export const config = { schedule: '@daily' }
