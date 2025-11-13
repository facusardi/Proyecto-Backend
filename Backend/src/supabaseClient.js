require('dotenv').config()

const { createClient } = require('@supabase/supabase-js')

// Polyfill para fetch si no existe (Node < 18)
if (!globalThis.fetch) {
  try {
    globalThis.fetch = require('node-fetch')
    console.log('[Supabase] Using node-fetch polyfill')
  } catch (e) {
    console.warn('[Supabase] No fetch available. Install node-fetch@2 or use Node >=18')
  }
}

const SUPABASE_URL = process.env.SUPABASE_URL || ''
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_KEY || ''

let supabase = null

async function getSupabase() {
  // Log para debug
  console.log('[Supabase] getSupabase called. URL present:', !!SUPABASE_URL, 'KEY present:', !!SUPABASE_SERVICE_KEY)

  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    const msg = 'Supabase env vars missing (SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY)'
    console.error('[Supabase] ERROR:', msg)
    throw new Error(msg)
  }

  if (supabase) {
    console.log('[Supabase] Returning cached client')
    return supabase
  }

  try {
    supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
    console.log('[Supabase] Client created successfully')
    return supabase
  } catch (err) {
    console.error('[Supabase] Error creating client:', err.message)
    throw err
  }
}

module.exports = { getSupabase }