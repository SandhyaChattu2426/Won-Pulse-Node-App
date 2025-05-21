const express = require('express')
const router = express.Router()
const { check } = require('express-validator')
const HttpError = require('../models/http-error')

const appointmentControllers = require('../controllers/appointment-controllers')

router.get('/hospital/:hospitalId', appointmentControllers.getAppointments)
router.post('/upload-excel', appointmentControllers.addAppointmentFromExcel)
router.get('/getId/:hospitalId', appointmentControllers.getId)
router.get('/patient/:Id',appointmentControllers.getAppointmentByPatientId)
router.get('/:Id/hospital/:hospitalId', appointmentControllers.getAppointmentById)
router.post('/', appointmentControllers.createAppointment)
router.patch('/Id', appointmentControllers.updateAppointments)
// router.patch('/status/:Id',appointmentControllers.updateAppointmentStatus)
router.patch('/status/hospital/:hospitalId/:id',appointmentControllers.updateStatus)
router.get('/doctor/:doctorId/date/:date/hospital/:hospitalId', appointmentControllers.getAppointmentsByDoctorIdAndDate)
router.get('/billing/:patientId/hospital/:hospitalId', appointmentControllers.GetAppointmentForBilling)


module.exports = router
