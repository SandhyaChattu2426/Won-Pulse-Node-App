
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

router.post('/getfileurl', upload.single("file"), ReportControllers.generateNoteUrl)
router.post('/upload-excel', ReportControllers.addReportFromExcel);
router.get('/getId/:hospitalId', ReportControllers.getId);
router.get('/:Id', ReportControllers.getReportById);
router.get('/patient/:patientName', ReportControllers.getReportByPatientId);
router.post('/', ReportControllers.AddReport);
router.get('/hospital/:hospitalId', ReportControllers.GetReports);
router.patch('/status/:id/:hospitalId', ReportControllers.updateReportStatus);
router.get('/billReport/:patientId/hospital/:hospitalId', ReportControllers.GetPendingReports);

module.exports = router;
