const express = require('express');
const router = express.Router();
const { getSupabase } = require('../supabaseClient');

console.log('[InteresesRoutes] Loading intereses routes...');

// GET: Obtener intereses de un usuario
router.get('/user/:userId', async (req, res) => {
  try {
    console.log('[InteresesRoutes] GET /user/:userId called');
    const { userId } = req.params;
    console.log('[InteresesRoutes] Fetching intereses for userId:', userId);
    
    const supabase = await getSupabase();

    const { data, error } = await supabase
      .from('Intereses')
      .select(`
        Intereses_ID,
        id_User,
        Tipo_De_Intereses (
          Intereses_ID,
          Nombre
        )
      `)
      .eq('id_User', userId);

    if (error) {
      console.error('[InteresesRoutes] Supabase error:', error);
      throw error;
    }

    console.log('[InteresesRoutes] Raw data from Supabase:', data);

    const interesesNombres = data
      .map(item => item.Tipo_De_Intereses?.Nombre)
      .filter(Boolean);

    console.log('[InteresesRoutes] Processed intereses:', interesesNombres);

    res.json({ 
      success: true, 
      data: interesesNombres 
    });
  } catch (error) {
    console.error('[InteresesRoutes] Error al obtener intereses:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// POST: Agregar/Actualizar intereses de un usuario
router.post('/user/:userId', async (req, res) => {
  try {
    console.log('[InteresesRoutes] POST /user/:userId called');
    const { userId } = req.params;
    const { intereses } = req.body;
    
    console.log('[InteresesRoutes] userId:', userId);
    console.log('[InteresesRoutes] intereses received:', intereses);

    if (!Array.isArray(intereses)) {
      return res.status(400).json({
        success: false,
        error: 'El campo "intereses" debe ser un array de IDs'
      });
    }

    const supabase = await getSupabase();

    // Primero eliminar intereses existentes
    console.log('[InteresesRoutes] Deleting existing intereses...');
    const { error: deleteError } = await supabase
      .from('Intereses')
      .delete()
      .eq('id_User', userId);

    if (deleteError) {
      console.error('[InteresesRoutes] Delete error:', deleteError);
      throw deleteError;
    }

    // Si no hay intereses para insertar, retornar éxito
    if (intereses.length === 0) {
      console.log('[InteresesRoutes] No intereses to insert');
      return res.json({ 
        success: true, 
        data: [],
        message: 'Intereses eliminados correctamente'
      });
    }

    // Insertar nuevos intereses
    console.log('[InteresesRoutes] Inserting new intereses...');
    const interesesData = intereses.map(interesId => ({
      id_User: userId,
      Intereses_ID: interesId
    }));

    const { data, error } = await supabase
      .from('Intereses')
      .insert(interesesData)
      .select();

    if (error) {
      console.error('[InteresesRoutes] Insert error:', error);
      throw error;
    }

    console.log('[InteresesRoutes] Intereses saved successfully:', data);

    res.json({ 
      success: true, 
      data,
      message: 'Intereses actualizados correctamente'
    });
  } catch (error) {
    console.error('[InteresesRoutes] Error al guardar intereses:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// GET: Obtener todos los tipos de intereses disponibles
router.get('/tipos', async (req, res) => {
  try {
    console.log('[InteresesRoutes] GET /tipos called');
    const supabase = await getSupabase();

    const { data, error } = await supabase
      .from('Tipo_De_Intereses')
      .select('*')
      .order('Nombre', { ascending: true });

    if (error) {
      console.error('[InteresesRoutes] Supabase error:', error);
      throw error;
    }

    console.log('[InteresesRoutes] Tipos de intereses:', data);

    res.json({ 
      success: true, 
      data 
    });
  } catch (error) {
    console.error('[InteresesRoutes] Error al obtener tipos de intereses:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

console.log('[InteresesRoutes] ✓ Intereses routes loaded');

module.exports = router;