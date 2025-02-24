const express = require('express')
const router = express.Router()
const { check } = require('express-validator')
const HttpError = require('../models/http-error')

const HospitalControllers = require('../controllers/hospitalRegistration-controllers')


router.get('/getId', HospitalControllers.getId)
router.get('/:Id',HospitalControllers.getHospitalById)
router.post('/', HospitalControllers.AddHospital)
router.post('/password/:Id',HospitalControllers.updatePassword)
 router.get('/', HospitalControllers.GetHospitals)
router.patch('/:Id', HospitalControllers.updateHospital)

module.exports = router
