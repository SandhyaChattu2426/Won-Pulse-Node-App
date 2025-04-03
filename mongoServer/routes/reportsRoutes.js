
const express = require('express');
const multer = require('multer');
const path = require('path');
const { check } = require('express-validator');
const HttpError = require('../models/http-error');
const ReportControllers = require("../controllers/reportsControllers");

const router = express.Router();

const fileFilter = (req, file, cb) => {
    cb(null, true); // Accept all files
};

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
    },
    fileFilter,
});



// Route to upload an Excel file and process it to add reports
// router.post('/upload-excel',  ReportControllers.addReportFromExcel);

// Other routes
router.post('/getfileurl',upload.single("file"),ReportControllers.generateNoteUrl)
router.post('/upload-excel', ReportControllers.addReportFromExcel);
router.get('/getId/:hospitalId', ReportControllers.getId);
router.get('/:Id', ReportControllers.getReportById);
router.get('/patient/:patientName', ReportControllers.getReportByPatientId);
router.post('/', ReportControllers.AddReport);
router.get('/hospital/:hospitalId', ReportControllers.GetReports);
router.patch('/status/:Id', ReportControllers.updateReportStatus);



module.exports = router;
