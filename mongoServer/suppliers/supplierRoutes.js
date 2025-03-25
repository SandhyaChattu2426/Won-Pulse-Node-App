const express = require('express')
const router = express.Router()
const { check } = require('express-validator')
const HttpError = require('../models/http-error')
const supplierControllers = require('./supplier-controllers')
router.get('/hospital/:hospitalId', supplierControllers.GetSuppliers)
router.post('/upload-excel', supplierControllers.addSupplierFromExcel)
router.post('/', supplierControllers.RegisterSupplier)
router.get('/getId/:hospitalId', supplierControllers.getId)
router.get('/pharmacy', supplierControllers.PharmacySuppliers)
router.get('/inventory', supplierControllers.InventorySuppliers)
router.get('/:Id', supplierControllers.GetSupplierById)

module.exports = router