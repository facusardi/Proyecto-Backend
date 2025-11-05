const express = require('express')
const router = express.Router()
const colabs = require('../controllers/colabsController')
const users = require('../controllers/usersController')

router.get('/colabs', colabs.getColabs)
router.post('/colabs', colabs.createColab)

router.get('/usuarios', users.getUsers)

module.exports = router