const express = require('express')
const router = express.Router()
const { check } = require('express-validator')

const pharmacyControllers=require('./pharmacy-controllers')

router.get('/charts',pharmacyControllers.getChartData );
router.post('/upload-excel',pharmacyControllers.addPharmacyFromExcel);
router.post('/',pharmacyControllers.RegisterMedicine);
router.patch('/instock/quantity',pharmacyControllers.UpdatePharmacyQuantity)
router.get('/getId/:hospitalId',pharmacyControllers.getId);
router.get('/:id', pharmacyControllers.getMedicineById);
router.get('/medicine/names',pharmacyControllers.getpharmaNames)
router.get('/name/:name',pharmacyControllers.getPharmacyByName)
router.get('/vaccine/:hospitalid' ,pharmacyControllers.getVaccinations)
router.get('/hospital/:hospitalId',pharmacyControllers.GetPharmacy);
router.patch('/status/:Id',pharmacyControllers.updateMedicineStatus)
module.exports = router