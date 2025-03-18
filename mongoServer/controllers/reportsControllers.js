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
        console.log("Reports block is triggering")
        const newPharmacy = new Reports({
            ...req.body,
        })
        await newPharmacy.save()
        console.log("Report is registered SuccessFully,triggering try-block")
        // console.log(req.body)
    }
    catch (e) {
        console.log(e)
        console.log("Catch-block")
    }
    res.json("Report Registered Sucessfully")
}

// GETTing Details

const GetReports = async (req, res, next) => {
    console.log("triggeing GET Reports")
    let List;
    try {
        List = await Reports.find({})
        console.log(List,"reportsList here")
    }
    catch (e) {
        console.log(e)
    }
    res.json({ List })
}

// GetId
const getId = async (req, res, next) => {
    let newpharmacyId;
    let pharmaLength;
    const str = "0";
    try {
        // Fetch all hospitals from the database
        const medicine = await Reports.find({});

        if (medicine.length > 0) {
            // Get the last hospital document, sorted by _id in descending order
            const lastRoom = await Reports.find({}).sort({ _id: -1 }).limit(1);
            console.log(lastRoom, "lastRoom")
            // Extract the last hospital's hospitalId
            const lastRoomId = lastRoom[0].reportDetails.reportId;
            // Calculate the next hospitalId based on the last one
            // Extract the numeric part of the last hospitalId (assuming the format is HP000001)
            const lastNumber = parseInt(lastRoomId.substring(2));  // Extracts the number part after 'HP'
            // Generate the next hospitalId (increment the last number)
            const nextNumber = lastNumber + 1;
            // Determine the number of leading zeros required for the new ID
            const zerosCount = 6 - nextNumber.toString().length;
            newRoomId = 'MR' + str.repeat(zerosCount) + nextNumber.toString();
        } else {
            // If no hospitals exist, create the first hospitalId
            newRoomId = 'MR' + '0'.repeat(5) + "1";  // HP000001
        }

        console.log("Generated Hospital ID:", newRoomId);
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
        console.log(medicine)
        // console.log("triggering tryblock")
    }
    catch (err) {

        console.log("catch block")
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
    console.log("Triggering update Medicine Status")
    try {
        console.log("Updation Inventorystatus")
        const InId = req.params.Id
        const medicine = await Pharmacy.findOne({ "reportDetails.reportId": InId })
        if (medicine) {
            try {
                medicine.status = req.body.status
                await medicine.save()
                return res.status(200).json({ message: "Pharmacy status updated successfully!" });

            } catch (e) {
                console.log(e)
                console.log("Could not find the patient")
            }
        }
    }
    catch (e) {
        console.log(e)
    }
}
const getReportByPatientId = async (req, res, next) => {
    console.log("Triggering Report In the Backend")
    const { patientName } = req.params
    console.log(patientName)

    let report
    try {
        report = await Reports.findOne({ "reportDetails.patientName": patientName })
        console.log("triggering try block")
        console.log(report)

    }
    catch (e) {
        console.log(e)
        // console.log("triggering catch-block")
    }
    res.json({ report })
}


const addReportFromExcel = async (req, res, next) => {
    // console.log("Triggering here");
    let last, lastId, newId;
    let createdItem;

    try {
        const totalItems = await Reports.countDocuments();
        if (totalItems > 0) {
            last = await Reports.findOne().sort({ _id: -1 });
            console.log(last);
            lastId = parseInt(last.reportDetails.reportId.slice(2));
            console.log(lastId, "lastid");
        } else {
            lastId = 0;
        }
        const prefix = "MR";
        const newNumber = lastId + 1;
        const paddedNumber = newNumber.toString().padStart(6, "0");
        newId = prefix + paddedNumber;
        console.log(newId);
    } catch (err) {
        return next(new HttpError(`Creating Report ID failed, Please try again. ${err}`, 500));
    }

    console.log(req.body, "request");
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
        console.log(existingPatient, "patient")

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
    console.log("Uploading File to S3 Bucket..."); 
    console.log(req.file,'this si the file')
        console.log(req.body,"body") 
    try {
        // Check for file
        // console.log(req.file)
        console.log(req.file,'this si the file')
        console.log(req.body,"body")
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