const express = require('express')
const router = express.Router()
const colabsController = require('../controllers/colabsController')
const usersController = require('../controllers/usersController')

// Rutas de colaboraciones
// GET /api/colabs
router.get('/colabs', colabsController.getColabs)
// POST /api/colabs
router.post('/colabs', colabsController.createColab)

// Rutas de usuarios
// GET /api/usuarios
router.get('/usuarios', usersController.getUsers)

module.exports = router