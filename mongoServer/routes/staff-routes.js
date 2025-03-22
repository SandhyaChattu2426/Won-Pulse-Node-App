const express = require('express')

const router = express.Router()
const { check } = require('express-validator')
const HttpError = require('../models/http-error')
const staffControllers = require('../controllers/staff-controllers')
router.post('/upload-excel',staffControllers.addStaffFromExcel)
router.get('/charts',staffControllers.getStaffChartData)
router.get('/getId', staffControllers.getId)
router.get('/:id', staffControllers.getStaffById)
router.get('/email/:email', staffControllers.checkEmail)
router.get('/', staffControllers.getStaff);
router.post('/', staffControllers.createStaff);
router.patch('/:id', staffControllers.updateStaff);
router.patch('/status/:Id',staffControllers.updateStaffStatus)
router.get('/hospital/:Id', staffControllers.getStaffByHplId)
module.exports = router





























