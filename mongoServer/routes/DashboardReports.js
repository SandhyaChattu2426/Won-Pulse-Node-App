const express = require("express");
const { check } = require('express-validator')

const reportsControllers = require('../controllers/dashboardReportControllers')

const router = express.Router();

router.get("/", reportsControllers.getReports)

router.get("/:sid", reportsControllers.getReportById)

router.post("/", reportsControllers.putId);

router.patch('/:aid', [
    check('report_title').not().isEmpty(),
    check('selected_table').not().isEmpty(),
    check('group_by').not().isEmpty(),
], reportsControllers.createReport)

router.patch('/update/:sid', reportsControllers.updateReport)

router.get('/get/:sid', reportsControllers.searchReport)

router.delete('/:sid', reportsControllers.deleteReport)

module.exports = router;