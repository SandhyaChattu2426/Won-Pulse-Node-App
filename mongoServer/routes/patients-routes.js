const express = require('express')
const router = express.Router()
const { check } = require('express-validator')
const HttpError = require('../models/http-error')
const CheckAuth = require('../middleWare/check-auth')

const patientsControllers = require('../controllers/patients-controllers')
const multer = require("multer");

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

router.post('/getfileurl',upload.single("file"),patientsControllers.generateNoteUrl)

router.post('/upload-excel',patientsControllers.addPatientFromExcel)
router.get('/getId', patientsControllers.getId);
router.get('/charts', patientsControllers.getPatientChartData);

router.get('/:Id', patientsControllers.getPatientById);
router.get('/', patientsControllers.getPatients);

// router.use(CheckAuth)
router.patch('/status/:Id',patientsControllers.updatePatientStatus)
router.patch('/:patientId', patientsControllers.updatePatient)
router.post('/addReport/:Id',patientsControllers.AddAppointment)

router.post('/bookAppointment/:Id',patientsControllers.AddAppointment)


router.post('/', patientsControllers.createPatient)

router.delete('/:id', patientsControllers.deletePatient)

module.exports = router