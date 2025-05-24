const express = require('express')
const router = express.Router()
const { check } = require('express-validator')
const HttpError = require('../models/http-error')

const AdmissionControllers = require('../controllers/admissionControllers')

router.post('/upload-excel', AdmissionControllers.addAdmissionFromExcel)
router.patch('/:Id/:hospitalId', AdmissionControllers.updateAdmission)
router.get('/patient/:name', AdmissionControllers.AdmissionByPatientId)
router.get('/getId/:hospitalId', AdmissionControllers.getId)
router.get('/patient/:patientId/hospital/:hospitalId', AdmissionControllers.getIdByPatientId)
router.get('/patientNames', AdmissionControllers.getRegisterdPatients)
router.get('/:Id/hospital/:hospitalId', AdmissionControllers.AdmissionDetailsById)
router.post('/', AdmissionControllers.AddPatient)
router.get('/hospital/:hospitalId', AdmissionControllers.GetAdmissions)
// router.patch('/Id', appointmentControllers.updateAppointments)
router.patch('/status/:id/:hospitalId', AdmissionControllers.updateAddmissionStatus)


module.exports = router
