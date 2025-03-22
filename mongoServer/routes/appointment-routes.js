const express = require('express')
const router = express.Router()
const { check } = require('express-validator')
const HttpError = require('../models/http-error')

const appointmentControllers = require('../controllers/appointment-controllers')

router.get('/hospital/:hospitalId', appointmentControllers.getAppointments)
router.post('/upload-excel', appointmentControllers.addAppointmentFromExcel)
router.get('/getId', appointmentControllers.getId)
router.get('/patient/:Id',appointmentControllers.getAppointmentByPatientId)
router.get('/:Id', appointmentControllers.getAppointmentById)
router.post('/', appointmentControllers.createAppointment)
router.patch('/Id', appointmentControllers.updateAppointments)
router.patch('/status/:Id',appointmentControllers.updateAppointmentStatus)

module.exports = router
