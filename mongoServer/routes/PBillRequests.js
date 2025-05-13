const express = require('express')
const router = express.Router()
const RequestControllers = require("../controllers/pbrControllers")
router.post('/', RequestControllers.CreateRequest)
router.get('/', RequestControllers.GetNotifiedBills)
router.get('/:id/hospital/:hospitalId', RequestControllers.GetBillRequestById)
// router.patch('/:id/status/hospital/:hospitalId',RequestControllers.UpdateStatus)

module.exports = router