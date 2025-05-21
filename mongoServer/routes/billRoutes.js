const express = require('express')
const router = express.Router()

const billControllers = require('../controllers/billControlleres')

router.get('/getId/:hospitalId', billControllers.getId)
router.post('/', billControllers.createBill)
// router.get('/patient/:Id',PharmaBillControllers.getBillByPatientId)
router.get('/:Id/hospital/:hositalID',billControllers.getBillByBillId)
//  router.get('/:Id', appointmentControllers.geet)
 router.get('/hospital/:hospitalId', billControllers.getBills)
// router.patch('/Id', appointmentControllers.updateAppointments)
// router.patch('/status/:Id',appointmentControllers.updateAppointmentStatus)

module.exports = router
