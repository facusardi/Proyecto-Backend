const express = require('express')
const router = express.Router()

// Rutas de datos (usuarios, colabs, intereses)
// Ejemplo mínimo
router.get('/health', (req, res) => res.json({ ok: true }))

module.exports = router