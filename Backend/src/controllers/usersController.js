const { getSupabase } = require('../supabaseClient')

exports.getUsers = async (req, res) => {
  try {
    const supabase = await getSupabase()
    const { data, error } = await supabase
      .from('Usuario')
      .select('id_User, Nombre, Apodo, Email, Rol_User')
    if (error) throw error
    res.json(data)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}