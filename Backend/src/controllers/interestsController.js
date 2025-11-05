const supabase = require('../supabaseClient')

// obtener tipos de intereses
exports.getTipos = async (req, res) => {
  const { data, error } = await supabase.from('Tipo_de_Intereses').select('*')
  if (error) return res.status(500).json({ message: error.message })
  res.json(data)
}

// insertar intereses de un usuario (array de Intereses_ID)
exports.saveIntereses = async (req, res) => {
  const { id_User, intereses } = req.body // intereses: [Intereses_ID,...]
  if (!id_User || !Array.isArray(intereses)) return res.status(400).json({ message: 'Datos inválidos' })

  const rows = intereses.map(i => ({ id_User, Intereses_ID: i }))
  const { error } = await supabase.from('Intereses').insert(rows)
  if (error) return res.status(500).json({ message: error.message })
  res.json({ message: 'Intereses guardados' })
}