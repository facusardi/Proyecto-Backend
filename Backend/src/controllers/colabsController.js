const { getSupabase } = require('../supabaseClient')

exports.getColabs = async (req, res) => {
  try {
    console.log('[Colabs] GET /api/colabs called')
    const supabase = await getSupabase()

    const { data, error } = await supabase
      .from('Aviso_Colabro') // ajusta si tu tabla se llama distinto
      .select('*, Usuario(id_User,Nombre,Apodo)')
      .order('Fecha', { ascending: false })

    if (error) {
      console.error('[Colabs] Supabase select error:', error)
      return res.status(500).json({ message: 'Error al obtener colaboraciones', details: error })
    }

    console.log('[Colabs] returning', Array.isArray(data) ? data.length : typeof data, 'items')
    return res.json(data || [])
  } catch (err) {
    console.error('[Colabs] Exception:', err && err.stack ? err.stack : err)
    return res.status(500).json({ message: 'Error servidor', details: String(err) })
  }
}

exports.createColab = async (req, res) => {
  try {
    console.log('[Colabs] POST /api/colabs called, body:', req.body)
    const supabase = await getSupabase()
    
    const { id_User, Descripcion, Fecha, Ubi } = req.body || {}

    if (!id_User || !Descripcion) {
      console.warn('[Colabs] validation failed, missing id_User or Descripcion')
      return res.status(400).json({ message: 'Faltan campos requeridos: id_User o Descripcion' })
    }

    const payload = { id_User, Descripcion, Fecha: Fecha || new Date().toISOString(), Ubi }

    const { data, error } = await supabase
      .from('Aviso_Colabro') // ajusta nombre de tabla
      .insert([payload])
      .select()

    if (error) {
      console.error('[Colabs] Supabase insert error:', error)
      return res.status(500).json({ message: 'Error al crear colaboración', details: error })
    }

    console.log('[Colabs] Inserted:', data)
    return res.status(201).json(data?.[0] || data)
  } catch (err) {
    console.error('[Colabs] Exception:', err && err.stack ? err.stack : err)
    return res.status(500).json({ message: 'Error servidor', details: String(err) })
  }
}