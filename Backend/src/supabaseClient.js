require('dotenv').config()

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
  console.error('Faltan SUPABASE_URL o SUPABASE_SERVICE_KEY en .env (backend).')
  process.exit(1)
}

let _supabase = null

async function getSupabase() {
  if (_supabase) return _supabase
  // import dinámico para evitar problemas con ESM-only packages
  const mod = await import('@supabase/supabase-js')
  const createClient = mod.createClient || mod.default?.createClient || mod.default
  _supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY)
  return _supabase
}

module.exports = { getSupabase }