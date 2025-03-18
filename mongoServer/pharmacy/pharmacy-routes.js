const express = require('express')
const router = express.Router()
const { check } = require('express-validator')
const HttpError = require('../models/http-error')
const pharmacyControllers=require('./pharmacy-controllers')

router.get('/chartdata',pharmacyControllers.getChartData);
router.post('/upload-excel',pharmacyControllers.addPharmacyFromExcel);
router.post('/',pharmacyControllers.RegisterMedicine);
router.patch('/instock/quantity',pharmacyControllers.UpdatePharmacyQuantity)
router.get('/getId',pharmacyControllers.getId);
router.get('/:id', pharmacyControllers.getMedicineById);
router.get('/medicine/names',pharmacyControllers.getpharmaNames)
router.get('/name/:name',pharmacyControllers.getPharmacyByName)
router.get('/',pharmacyControllers.GetPharmacy);
router.patch('/status/:Id',pharmacyControllers.updateMedicineStatus)
module.exports = router