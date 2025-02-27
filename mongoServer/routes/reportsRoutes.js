
const express = require('express');
const multer = require('multer');
const path = require('path');
const { check } = require('express-validator');
const HttpError = require('../models/http-error');
const ReportControllers = require("../controllers/reportsControllers");

const router = express.Router();


// Filter to allow only Excel files
const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || 
        file.mimetype === 'application/vnd.ms-excel') {
        cb(null, true);
    } else {
        cb(new HttpError('Only Excel files are allowed.', 400), false);
    }
};


// Route to upload an Excel file and process it to add reports
// router.post('/upload-excel',  ReportControllers.addReportFromExcel);

// Other routes
router.post('/upload-excel', ReportControllers.addReportFromExcel);
router.get('/getId', ReportControllers.getId);
router.get('/:Id', ReportControllers.getReportById);
router.get('/patient/:patientName', ReportControllers.getReportByPatientId);
router.post('/', ReportControllers.AddReport);
router.get('/', ReportControllers.GetReports);
router.patch('/status/:Id', ReportControllers.updateReportStatus);

module.exports = router;
