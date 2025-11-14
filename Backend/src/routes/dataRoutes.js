const express = require('express')
const router = express.Router()
const colabsController = require('../controllers/colabsController')

// GET /api/colabs
router.get('/colabs', colabsController.getColabs)
// POST /api/colabs
router.post('/colabs', colabsController.createColab)

module.exports = router