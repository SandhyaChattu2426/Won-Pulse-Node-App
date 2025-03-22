const express = require('express')
const router = express.Router()
const inventoryControllers=require('./inventory-controllers')

router.get('/charts', inventoryControllers.getChartData)
router.post('/upload-excel',inventoryControllers.addInventoryFromExcel)
router.post('/', inventoryControllers.createInventory)
router.patch('/instock/quantity', inventoryControllers.UpdateInventoryQuantity)
router.get('/names',inventoryControllers.getInvNames)
router.get('/invby/:Id', inventoryControllers.getInventoryById)
router.get('/getId', inventoryControllers.getId)
router.patch('/:Id', inventoryControllers.UpdateInventoryDetails)
router.patch('/status/:Id',inventoryControllers.updateInventoryStatus)
router.get('/name/:name',inventoryControllers.getInventoryByName)
router.get('/hospital/:hospitalId', inventoryControllers.gettingALLInventories)

module.exports = router