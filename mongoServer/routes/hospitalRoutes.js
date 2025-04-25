const express = require('express')
const router = express.Router()
const { check } = require('express-validator')
const HttpError = require('../models/http-error')

const HospitalControllers = require('../controllers/hospitalRegistration-controllers')

router.get('/email/:email',HospitalControllers.getHospitalByEmail)
router.get('/getId/:hospitalId', HospitalControllers.getId)
router.get('/:Id',HospitalControllers.getHospitalById)
router.get('/hospital/:hospitalId',HospitalControllers.getHospitalReturnName)

router.post('/', HospitalControllers.AddHospital)
router.post('/password/:Id',HospitalControllers.updatePassword)
 router.get('/', HospitalControllers.GetHospitals)
router.patch('/:Id', HospitalControllers.updateHospital)
router.post('/store-alert/:hospitalId', HospitalControllers.AddAnnouncements)
module.exports = router
