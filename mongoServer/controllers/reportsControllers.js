const { response } = require('express')
const HttpError = require('../models/http-error')
const XLSX = require('xlsx');
const fs = require('fs'); // For reading the file stream
const path = require('path'); 
const mongoose = require("mongoose");

const Reports = require('../models/reports')

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
    console.log("Triggering here")
    let last, lastId, newId;
    let createdItem;
    try {
        const totalItems = await Reports.countDocuments();
        if (totalItems > 0) {
            last = await Reports.findOne().sort({ _id: -1 });
            console.log(last)
            lastId = parseInt(last.reportDetails.reportId.slice(2));
            console.log(lastId, "lastid")
        } else {
            lastId = 0;
        }

        const prefix = "MR";
        const newNumber = lastId + 1;
        const paddedNumber = newNumber.toString().padStart(6, "0");
        newId = prefix + paddedNumber;
        console.log(newId)
    } catch (err) {
        return next(new HttpError(`Creating Report ID failed, Please try again. ${err}`, 500));
    }

    // Validate inputs
    // const errors = validationResult(req);
    // if (!errors.isEmpty()) {
    //     return next(new HttpError("Invalid inputs passed, please check your data", 422));
    // }

    console.log(req.body, "request")
   

    //  try {
    //     let existingItem;

    //     // ✅ 1️⃣ Check for existing item using `item_id`
    //     if (req.body.reportId) {
    //         existingItem = await Reports.findOne({ item_id });
    //     }

    //     if (existingItem) {
    //         // ✅ Update existing item by `item_id`
    //         const updatedItem = await Reports.findOneAndUpdate(
    //             { item_id },
    //             { $set: req.body },
    //             { new: true }
    //         );

    //         return res.status(200).json({
    //             message: "Item updated successfully.",
    //             updatedItem,
    //         });
    //     } else {
    //         // ✅ 2️⃣ If no `item_id`, check for existing item by `item_category` and `item_brand`
    //         existingItem = await Reports.findOne({
    //             item_name,
    //             item_brand,
    //         });

    //         if (existingItem) {
    //             // ✅ If found, update the existing record
    //             const updatedItem = await Reports.findOneAndUpdate(
    //                 { item_name, item_brand },
    //                 { $set: req.body },
    //                 { new: true }
    //             );

    //             return res.status(200).json({
    //                 message: "Item updated successfully.",
    //                 updatedItem,
    //             });
    //         }
    //     }
    // } catch (err) {
    //     return next(new HttpError(`Error checking for existing item: ${err}`, 500));
    // }

    // Create a new inventory item
    const excelSerialToJSDate = (serial) => {
        const excelEpoch = new Date(1900, 0, 1); // Excel starts from Jan 1, 1900
        return new Date(excelEpoch.getTime() + (serial - 1) * 86400000); // Convert serial number to date
    };
    
    createdItem = new Reports({
        reportDetails:{
        reportId:newId,
        category: req.body.category,
        serviceName: req.body.serviceName,
        patientName: req.body.patientName,
        collectionDate:req.body.collectionDate,
        resultStatus:req.body.resultStatus,
        testResults:req.body.testResults,
        comments:req.body.comments,
        generationDate:excelSerialToJSDate(req.body.generationDate)
    ,
    status:req.body.status|| "Active"
        }
    });

    if (!req.body.patientname || !req.body.servicename || !req.body.testresults ||  !req.body.status) {
        return res.status(400).send({ message: "Incomplete Report details." });
    }
    else {
        try {
           

            await createdItem.save()
            res.status(201).json({ item: createdItem });
        } catch (err) {
            return next(new HttpError(`Creating Admission failed, Please try again. ${err}`, 500));
        }
    }
}




exports.AddReport = AddReport
exports.getId = getId
exports.GetReports = GetReports
exports.updateReportStatus = updateReportStatus
exports.getReportByPatientId = getReportByPatientId
exports.getReportById = getReportById
// exports.addReportFromExcel = addReportFromExcel