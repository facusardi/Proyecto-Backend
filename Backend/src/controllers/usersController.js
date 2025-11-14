const { getSupabase } = require('../supabaseClient')

exports.getUsers = async (req, res) => {
  try {
    console.log('========================================')
    console.log('[UsersController] 🚀 Fetching users with interests...')
    const supabase = await getSupabase()
    
    // Obtener usuarios
    const { data: users, error: usersError } = await supabase
      .from('Usuario')
      .select('id_User, Nombre, Apellido, Apodo, Email, Rol_User')
      .order('id_User', { ascending: true })
    
    if (usersError) {
      console.error('[UsersController] ❌ Error fetching users:', usersError)
      throw usersError
    }

    console.log(`[UsersController] ✅ Found ${users.length} users`)

    // Para cada usuario, obtener sus intereses
    const usersWithInterests = []
    
    for (const user of users) {
      console.log(`\n[UsersController] 📋 Processing user: ${user.Apodo} (ID: ${user.id_User})`)
      
      const { data: interesesData, error: interesesError } = await supabase
        .from('Intereses')
        .select(`
          Intereses_ID,
          Tipo_De_Intereses (
            Intereses_ID,
            Nombre
          )
        `)
        .eq('id_User', user.id_User)

      if (interesesError) {
        console.error(`[UsersController] ❌ Error fetching interests for ${user.Apodo}:`, interesesError)
        usersWithInterests.push({ ...user, intereses: [] })
        continue
      }

      console.log(`[UsersController] 📦 Raw data for ${user.Apodo}:`, JSON.stringify(interesesData, null, 2))

      // Extraer nombres de intereses
      const interesesNombres = interesesData
        .map(item => item.Tipo_De_Intereses?.Nombre)
        .filter(Boolean)

      console.log(`[UsersController] 🏷️  Extracted interests for ${user.Apodo}:`, interesesNombres)

      // IMPORTANTE: Agregar intereses al usuario
      const userWithInterests = {
        id_User: user.id_User,
        Nombre: user.Nombre,
        Apellido: user.Apellido,
        Apodo: user.Apodo,
        Email: user.Email,
        Rol_User: user.Rol_User,
        intereses: interesesNombres
      }

      console.log(`[UsersController] 👤 User object:`, JSON.stringify(userWithInterests, null, 2))
      usersWithInterests.push(userWithInterests)
    }
    
    console.log('\n========================================')
    console.log(`[UsersController] ✅ Returning ${usersWithInterests.length} users with interests`)
    console.log('[UsersController] 📤 First user sample:', JSON.stringify(usersWithInterests[0], null, 2))
    console.log('========================================\n')
    
    res.json(usersWithInterests)
  } catch (err) {
    console.error('[UsersController] ❌ FATAL ERROR:', err.message)
    console.error(err.stack)
    res.status(500).json({ message: err.message })
  }
}