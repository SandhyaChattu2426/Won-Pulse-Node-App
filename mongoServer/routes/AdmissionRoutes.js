const express = require('express')
const router = express.Router()
const { check } = require('express-validator')
const HttpError = require('../models/http-error')

const AdmissionControllers = require('../controllers/admissionControllers')

router.post('/upload-excel', AdmissionControllers.addAdmissionFromExcel)

router.get('/getId', AdmissionControllers.getId)
router.get('/IdPatient/:Id',AdmissionControllers.AdmissionByPatientId)
router.patch('/update/:Id',AdmissionControllers.updateAdmission)
router.get('/patientNames',AdmissionControllers.getRegisterdPatients)
router.get('/:Id', AdmissionControllers.AdmissionDetailsById)
router.post('/', AdmissionControllers.AddPatient)
router.get('/hospital/:hospitalId', AdmissionControllers.GetAdmissions)
// router.patch('/Id', appointmentControllers.updateAppointments)
router.patch('/status/:Id',AdmissionControllers.updateAddmissionStatus)


module.exports = router
