const { v4: uuid } = require('uuid')
const mongoose = require("mongoose")
const { validationResult } = require('express-validator')

const HttpError = require('../models/http-error')
const Report = require('../models/DashBoardReport')


const getReports = async (req, res, next) => {
    console.log("trigger")
    let last
    let lastId
    let newId
    try {
        const long = (await Report.find({})).length
        // console.log(long)
        if (long) {
            last = await Report.findOne().sort({ _id: -1 }); // Sort by _id in descending order
            lastId = parseInt(last.report_id.slice(2)); // Extract numeric part

        } else {
            lastId = 0
            // console.log("No documents found.");
        }
        const prefix = "RP";
        const newNumber = lastId + 1;
        const paddedNumber = newNumber.toString().padStart(6, "0"); // Pads with leading zeros
        newId = prefix + paddedNumber;
        // console.log(newId)

    }
    catch (err) {
        console.log(err,"er")
        const error = new HttpError(`Creating Report failed, Please try again. ${err}`, 500)
        return next(error)
    }

    let reports
    console.log(Report,"RP")
    try {
        reports = await Report.find({})
        // .skip(0)
        // .limit(20)
        console.log(reports)

    }
    catch (err) {
        const error = new HttpError(`Fetching reports failed, please try again later. ${err}`, 500)
        return next(error)
    }
    res.json({ reports: reports.map(report => report.toObject({ getters: true })) ,newId:newId})
}

const getReportById = async (req, res, next) => {
    const reportType = req.params.sid;
    // console.log(reportType)
    let report
    try {
        report = await Report.find({ type: reportType })

    } catch (err) {
        const error = new HttpError(`Something went wrong, could not find a report.${err}`, 500)
        return next(error)
    }

    // const place = DUMMY.find((p) => {
    //     return p.id === placeId;
    // })

    if (!report) {
        throw new HttpError('Could not find a report for the provided id.', 404)
        return next(error)
        // error.code = 404
        // throw error
        // return res.status(404).json({ message: 'Could not find a place for the provided id.' })
    }

    // console.log("GET Request in Places", institute);
    res.json({ reports: report })
}

// const putId = async (req, res, next) => {
//     console.log("triggering")
//     const errors = validationResult(req)
//     if (!errors.isEmpty()) {
//         // console.log(errors)
//         // res.status(422)
//         throw new HttpError('Invalid inputs passed, please check your data')
//     }


//     const {
//         report_id, report_title, selected_table,
//         group_by, stack_by, aggregation,
//         date_label, visibility, gauge_report_fields,
//         display_table, short_description, view,
//         filter_conditions, type, created_by,
//         created_on, interval_duration, last_modified_date,
//         last_modified_by,
//     } = req.body
//     console.log(req.body,"body")

//     const createdReport = new Report({
//         report_id, report_title, selected_table,
//         group_by, stack_by, aggregation,
//         date_label, visibility, gauge_report_fields,
//         display_table, short_description, view,
//         filter_conditions, type, created_by,
//         created_on, interval_duration, last_modified_date,
//         last_modified_by,
//     })
//     try {
//         const sess = await mongoose.startSession()
//         sess.startTransaction()
//         await createdReport.save({ session: sess })
//         await sess.commitTransaction()
//         sess.endSession();
//         console.log("tri try")
//     }
//     catch (err) {
//         const error = new HttpError(`Creating report failed, Please try again. ${err}`, 500)
//         console.log(error,"error")
//         return next(error)
//     }

//     // DUMMY.push(createdPlace)

//     res.status(201).json({ report: createdReport })
// }

const putId = async (req, res, next) => {
    console.log("Triggering report creation...");

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ error: "Invalid inputs passed, please check your data" });
    }

    try {
        //  Call function to get new report_id

        const {report_id,
            report_title, selected_table, group_by, stack_by, aggregation,
            date_label, visibility, gauge_report_fields, display_table, short_description,
            view, filter_conditions, type, created_by, created_on, interval_duration,
            last_modified_date, last_modified_by
        } = req.body;


        const createdReport = new Report({
            report_id, report_title, selected_table, group_by, stack_by, aggregation,
            date_label, visibility, gauge_report_fields, display_table, short_description,
            view, filter_conditions, type, created_by, created_on, interval_duration,
            last_modified_date, last_modified_by
        });

        await createdReport.save(); // Save the report
        console.log("Report saved successfully");
        res.status(201).json({ report: createdReport });
    } catch (err) {
        console.error("Error saving report:", err);
        return res.status(500).json({ error: `Creating report failed, Please try again. ${err.message}` });
    }
};

const createReport = async (req, res, next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        // console.log(errors)
        // res.status(422)
        throw new HttpError('Invalid inputs passed, please check your data')
    }

    const {
        report_title, selected_table,
        group_by, stack_by, aggregation,
        date_label, visibility, gauge_report_fields,
        display_table, short_description, view,
        filter_conditions, type, interval_duration,
        last_modified_date, last_modified_by,
    } = req.body
    const reportId = req.params.aid
    // console.log(studentId)

    let report
    try {
        report = await Report.find({ report_id: reportId })
        // console.log(report)
    }
    catch (err) {
        const error = new HttpError(`Something went wrong, could not update report.${err}`, 500)
        return next(error)
    }
    report = report[0]

    // const updatedPlace = DUMMY.find(p => p.id === placeId)
    // const placeIndex = DUMMY.find(p => p.id === placeId)
    report.report_title = report_title
    report.selected_table = selected_table
    report.group_by = group_by
    report.stack_by = stack_by
    report.aggregation = aggregation
    report.date_label = date_label
    report.visibility = visibility
    report.gauge_report_fields = gauge_report_fields
    report.display_table = display_table
    report.short_description = short_description
    report.view = view
    report.filter_conditions = filter_conditions
    report.type = type
    report.interval_duration = interval_duration
    report.last_modified_date = last_modified_date
    report.last_modified_by = last_modified_by
    try {
        await report.save()
    }
    catch (err) {
        const error = new HttpError(`Something went wrong, could not update report.${err}`, 500)
        return next(error)
    }

    // DUMMY[placeIndex] = updatedPlace

    res.status(200).json({ report, success: true })
}

const updateReport = async (req, res, next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        // res.status(422)
        return next(new HttpError('Invalid inputs passed, please check your data'))
    }

    const {
        report_title, selected_table,
        group_by, stack_by, aggregation,
        date_label, visibility, gauge_report_fields,
        display_table, short_description, view,
        filter_conditions, type, interval_duration,
        last_modified_date, last_modified_by,
    } = req.body
    const reportId = req.params.sid

    let report
    try {
        report = await Report.find({ report_id: reportId })
        console.log(report)

    }
    catch (err) {
        const error = new HttpError(`Something went wrong, could not update report.${err}`, 500)
        return next(error)
    }
    report = report[0]

    // const updatedPlace = DUMMY.find(p => p.id === placeId)
    // const placeIndex = DUMMY.find(p => p.id === placeId)

    report.report_title = report_title
    report.selected_table = selected_table
    report.group_by = group_by
    report.stack_by = stack_by
    report.aggregation = aggregation
    report.date_label = date_label
    report.visibility = visibility
    report.gauge_report_fields = gauge_report_fields
    report.display_table = display_table
    report.short_description = short_description
    report.view = view
    report.filter_conditions = filter_conditions
    report.type = type
    report.interval_duration = interval_duration
    report.last_modified_date = last_modified_date
    report.last_modified_by = last_modified_by
    try {
        await report.save()
    }
    catch (err) {
        const error = new HttpError(`Something went wrong, could not update report.${err}`, 500)
        return next(error)
    }

    // DUMMY[placeIndex] = updatedPlace

    res.status(200).json({ report: report })
}

const searchReport = async (req, res, next) => {
    const search = req.params.sid;
    console.log(req.query)
    let reports
    try {
        reports = await Report.find({
            $or: [
                { report_id: { $regex: search, $options: 'i' } },
                { report_title: { $regex: search, $options: 'i' } },
                { selected_table: { $regex: search, $options: 'i' } },
                { group_by: { $regex: search, $options: 'i' } },
                { stack_by: { $regex: search, $options: 'i' } },
                { aggregation: { $regex: search, $options: 'i' } },
                { date_label: { $regex: search, $options: 'i' } },
                { visibility: { $regex: search, $options: 'i' } },
                { gauge_report_fields: { $regex: search, $options: 'i' } },
                { display_table: { $regex: search, $options: 'i' } },
                { view: { $regex: search, $options: 'i' } },
                { filter_conditions: { $regex: search, $options: 'i' } },
                { type: { $regex: search, $options: 'i' } },
                { interval_duration: { $regex: search, $options: 'i' } },
            ]
        });
    } catch (err) {
        const error = new HttpError(`Something went wrong, could not find a report.${err}`, 500)
        return next(error)
    }

    // const place = DUMMY.find((p) => {
    //     return p.id === placeId;
    // })

    if (!reports) {
        throw new HttpError('Could not find a report for the provided id.', 404)
        return next(error)
        // error.code = 404
        // throw error
        // return res.status(404).json({ message: 'Could not find a place for the provided id.' })
    }

    // console.log("GET Request in Places", institute);
    res.json({ reports: reports })
}

const deleteReport = async (req, res, next) => {
    const reportId = req.params.sid
    // console.log(schoolId)
    let report
    try {
        report = await Report.findOne({ report_id: reportId })
        // console.log(school)
    }
    catch (err) {
        const error = new HttpError(`Something went wrong, could not delete report. ${err}`, 500)
        return next(error)
    }

    // if (!DUMMY.find(p => p.id === placeId)) {
    //     throw new HttpError('Could not find a place for that id', 404)
    // }

    // DUMMY = DUMMY.filter(p => p.id !== placeId)

    try {
        const sess = await mongoose.startSession()
        sess.startTransaction()
        await report.deleteOne({ session: sess })
        await sess.commitTransaction()
        sess.endSession();

    }
    catch (err) {
        const error = new HttpError(`Something went wrong, could not delete report. ${err}`, 500)
        return next(error)
    }

    res.status(200).json({ message: 'Deleted report.' })
}

exports.getReports = getReports
exports.getReportById = getReportById
exports.putId = putId;
exports.createReport = createReport
exports.updateReport = updateReport
exports.searchReport = searchReport
exports.deleteReport = deleteReport