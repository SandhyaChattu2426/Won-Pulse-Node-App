const { response } = require('express')
const { services } = require('../models/Services')
const HttpError = require('../models/http-error')
const XLSX = require('xlsx');
const fs = require('fs'); // For reading the file stream
const path = require('path');
const mongoose = require("mongoose");
const Patients = require("../models/patient")

const Reports = require('../models/reports')
const {uploadFileToS3Bucket}=require('../models/s3Bucket')

//Register Supplier

const AddReport = async (req, res, next) => {
    // const { supplierDetails, adress } = req.body
    try {
        const newPharmacy = new Reports({
            ...req.body,
        })
        await newPharmacy.save()
        // console.log(req.body)
    }
    catch (e) {
        console.log(e)
    }
    res.json("Report Registered Sucessfully")
}

// GETTing Details

const GetReports = async (req, res, next) => {
    const {hospitalId}=req.params
    // console.log(hospitalId,"hospitalId")
    let List;
    try {
        List = await Reports.find({hospitalId:hospitalId})
        // console.log(List,"List")
    }
    catch (e) {
        console.log(e)
    }
    res.json({ List })
}

// GetId
const getId = async (req, res, next) => {
    const {hospitalId}=req.params
    const str = "0";
    try {
        const medicine = await Reports.find({hospitalId});

        if (medicine.length > 0) {
            const lastRoom = await Reports.find({hospitalId}).sort({ _id: -1 }).limit(1);
            const lastRoomId = lastRoom[0].reportDetails.reportId;
            const lastNumber = parseInt(lastRoomId.substring(2));  
            const nextNumber = lastNumber + 1;
            const zerosCount = 6 - nextNumber.toString().length;
            newRoomId = 'MR' + str.repeat(zerosCount) + nextNumber.toString();
        } else {
            newRoomId = 'MR' + '0'.repeat(5) + "1";  
        }

        // console.log("Generated Hospital ID:", newRoomId);
        res.json({ id: newRoomId });
    } catch (err) {
        console.log(err)

    }
};

// Get MedicineById
const getReportById = async (req, res, next) => {
    const medicineId = req.params.Id
    let medicine;
    try {
        medicine = await Reports.find({ "reportDetails.reportId": medicineId })
        // console.log(medicine)
        // console.log("triggering tryblock")
    }
    catch (err) {

        // console.log("catch block")
        console.log(err)
    }
    if (!medicine) {
        const error = new HttpError('Could not find a medicine for the Provided id.', 404)
        return next(error)
    }
    res.json({ report: medicine })
}

// Update Status Of Inventory
const updateReportStatus = async (req, res, next) => {
    // console.log("Triggering update Medicine Status")
    try {
        // console.log("Updation Inventorystatus")
        const InId = req.params.Id
        const medicine = await Pharmacy.findOne({ "reportDetails.reportId": InId })
        if (medicine) {
            try {
                medicine.status = req.body.status
                await medicine.save()
                return res.status(200).json({ message: "Pharmacy status updated successfully!" });

            } catch (e) {
                console.log(e)
                // console.log("Could not find the patient")
            }
        }
    }
    catch (e) {
        console.log(e)
    }
}
const getReportByPatientId = async (req, res, next) => {
    // console.log("Triggering Report In the Backend")
    const { patientName } = req.params

    let report
    try {
        report = await Reports.findOne({ "reportDetails.patientName": patientName })

    }
    catch (e) {
        console.log(e)
    }
    res.json({ report })
}


const addReportFromExcel = async (req, res, next) => {
    let last, lastId, newId;
    let createdItem;

    try {
        const totalItems = await Reports.countDocuments();
        if (totalItems > 0) {
            last = await Reports.findOne().sort({ _id: -1 });
            lastId = parseInt(last.reportDetails.reportId.slice(2));
        } else {
            lastId = 0;
        }
        const prefix = "MR";
        const newNumber = lastId + 1;
        const paddedNumber = newNumber.toString().padStart(6, "0");
        newId = prefix + paddedNumber;
    } catch (err) {
        return next(new HttpError(`Creating Report ID failed, Please try again. ${err}`, 500));
    }

    const excelSerialToJSDate = (serial) => {
        const excelEpoch = new Date(1900, 0, 1);
        return new Date(excelEpoch.getTime() + (serial - 1) * 86400000).toISOString().split("T")[0];
    };
    // Extract request body values
    const {
        category,
        servicename,
        patientname,
        collectiondate,
        resultstatus,
        testresults,
        comments,
        generationdate,
        status = "Active",
    } = req.body;

    let [firstName, ...lastNameParts] = patientname.trim().split(" ");
    let lastName = lastNameParts.join(" "); // Handle multi-word last names

    try {
        // 🔹 Search for patient in `Patient` collection using firstName & lastName
        const existingPatient = await Patients.findOne({
            firstName: new RegExp(`^${firstName}$`, "i"), // Case-insensitive match
            LastName: new RegExp(`^${lastName}$`, "i"),
        });

        if (!existingPatient) {
            return res.status(404).json({ message: "Patient is not Registered" });
        }
    } catch (e) {
        console.log(e)
    }

    try {
        const existingReport = await Reports.findOne({
            "reportDetails.serviceName": servicename,
            "reportDetails.collectionDate": collectiondate,
            "reportDetails.patientName": patientname,
        });

        if (existingReport) {
            return res.status(409).json({ message: "Report already exists with the same service name, collection date, and patient name." });
        }
    } catch (err) {
        return next(new HttpError(`Checking existing reports failed, Please try again. ${err}`, 500));
    }
    // Validate required fields
    if (!patientname || !servicename || !testresults || !status) {
        return res.status(400).send({ message: "Incomplete Report details." });
    }

    // Create a new report if it does not exist
    createdItem = new Reports({
        reportDetails: {
            reportId: newId,
            category,
            serviceName: servicename,
            patientName: patientname,
            collectionDate: excelSerialToJSDate(collectiondate),
            resultStatus: resultstatus,
            testResults: testresults,
            comments,
            generationDate: excelSerialToJSDate(generationdate),
        },
        status,
    });

    try {
        await createdItem.save();
        res.status(201).json({ item: createdItem });
    } catch (err) {
        return next(new HttpError(`Creating Report failed, Please try again. ${err}`, 500));
    }
};

const generateNoteUrl = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "No file provided",
            });
        }

        // Upload image to S3
        console.log(req.file,"file @backend")
        console.log(req.body,"body")
        const fileUrl = await uploadFileToS3Bucket(req.file);
        console.log(fileUrl,"fileUrl")
        if (!fileUrl) {
            return res.status(500).json({
                success: false,
                message: "Failed to upload file to S3",
            });
        }

        return res.status(200).json({
            success: true,
            message: "File uploaded successfully.",
            fileUrl,
            name:req.file.originalname
        });
    } catch (error) {
        console.error("Error uploading File:", error);
        return res.status(500).json({
            success: false,
            message: "Error uploading File, try again.",
        });
    }
};





exports.AddReport = AddReport
exports.getId = getId
exports.GetReports = GetReports
exports.updateReportStatus = updateReportStatus
exports.getReportByPatientId = getReportByPatientId
exports.getReportById = getReportById
exports.addReportFromExcel = addReportFromExcel
exports.generateNoteUrl=generateNoteUrl