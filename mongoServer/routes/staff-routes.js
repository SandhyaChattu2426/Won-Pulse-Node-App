const express = require('express')

const router = express.Router()
const { check } = require('express-validator')
const HttpError = require('../models/http-error')
const staffControllers = require('../controllers/staff-controllers')
router.post('/upload-excel',staffControllers.addStaffFromExcel)
router.get('/charts',staffControllers.getStaffChartData)
router.get('/getId/:hospitalId', staffControllers.getId)
router.get('/hospital/:hospitalId/staff/:id', staffControllers.getStaffById)
router.get('/email/:email', staffControllers.checkEmail)
router.get('/hospital/:hospitalId', staffControllers.getStaff);
router.post('/', staffControllers.createStaff);
router.patch('/:id/:hospitalid', staffControllers.updateStaff);
router.patch('/status/:staffId/:hospitalId',staffControllers.updateStaffStatus)
router.get('/hospital/:Id', staffControllers.getStaffByHplId)
router.get('/role/:roleName/hospital/:hospitalId', staffControllers.getStaffByRoleName)

module.exports = router





























