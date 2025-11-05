const { getSupabase } = require('../supabaseClient')

exports.getColabs = async (req, res) => {
  try {
    const supabase = await getSupabase()
    const { data, error } = await supabase
      .from('Aviso_Colabro')
      .select('*, Usuario:id_User(Nombre,Apodo)')
      .order('Fecha', { ascending: false })
    if (error) throw error
    res.json(data)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

exports.createColab = async (req, res) => {
  try {
    const { id_User, Descripcion, Fecha, Ubi } = req.body
    if (!Descripcion) return res.status(400).json({ message: 'Falta Descripcion' })

    const supabase = await getSupabase()
    const { data, error } = await supabase
      .from('Aviso_Colabro')
      .insert([{ id_User, Descripcion, Fecha, Ubi }])
      .select()
    if (error) throw error
    res.status(201).json(data[0])
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}