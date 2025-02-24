const express = require('express')
const router = express.Router()
const { check } = require('express-validator')
const HttpError = require('../models/http-error')

const billControllers = require('../controllers/billControlleres')


 router.get('/getId', billControllers.getId)
router.post('/', billControllers.createBill)
// router.get('/patient/:Id',PharmaBillControllers.getBillByPatientId)
router.get('/:Id',billControllers.getBillByBillId)
//  router.get('/:Id', appointmentControllers.geet)
 router.get('/', billControllers.getBills)
// router.patch('/Id', appointmentControllers.updateAppointments)
// router.patch('/status/:Id',appointmentControllers.updateAppointmentStatus)

module.exports = router
