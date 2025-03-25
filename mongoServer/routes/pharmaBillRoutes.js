const express = require('express')
const router = express.Router()
const { check } = require('express-validator')
const HttpError = require('../models/http-error')

const PharmaBillControllers = require('../controllers/pharmacyBillingControllers')


router.get('/getId', PharmaBillControllers.getId)
router.post('/', PharmaBillControllers.createBill)
router.get('/patient/:Id',PharmaBillControllers.getBillByPatientId)
router.get('/:Id',PharmaBillControllers.getBillByBillId)
//  router.get('/:Id', appointmentControllers.geet)
router.get('/hospital/:hospitalId', PharmaBillControllers.getBills)
// router.patch('/Id', appointmentControllers.updateAppointments)
// router.patch('/status/:Id',appointmentControllers.updateAppointmentStatus)

module.exports = router
