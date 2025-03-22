
const express = require('express')
const ServiceControllers = require('../controllers/servicesControllers')
const router = express.Router()

router.get('/hospital/:hospitalId', ServiceControllers.GetServices)
router.get('/getId', ServiceControllers.getId)
router.post('/upload-excel', ServiceControllers.addServiceFromExcel)
router.post('/', ServiceControllers.createService)
router.get('/:Id', ServiceControllers.getServicesById)
router.get('/serviceByName/:serviceName', ServiceControllers.getServiceByName)
router.patch('/updatePrice/:Id', ServiceControllers.updatePrice)
router.get('/report/names', ServiceControllers.getReportNames)
router.get('/pharma/names', ServiceControllers.getPharmaNames)
router.get('/general/names', ServiceControllers.getGeneralServicesNames)
router.get('/category/:category', ServiceControllers.getServiceByCategory)
router.patch('/status/:Id', ServiceControllers.updateServiceStatus)

module.exports = router

