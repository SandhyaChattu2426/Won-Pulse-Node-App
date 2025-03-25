const express = require('express')
const router = express.Router()

const rollControllers = require('../controllers/rolesControllers')

router.get('/hospital/:hospitalId', rollControllers.GetRoles)
router.get('/getId/:hospitalId', rollControllers.getId)
router.post('/', rollControllers.AddRole)
router.get('/:roleId/hospital/:hospitalId',rollControllers.GetRoleById)
router.get('/:role',rollControllers.GetRoleByName)
//  router.get('/:Id', appointmentControllers.geet)
// router.patch('/Id', appointmentControllers.updateAppointments)
// router.patch('/status/:Id',appointmentControllers.updateAppointmentStatus)

module.exports = router
