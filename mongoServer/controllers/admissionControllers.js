const { response } = require('express')
const HttpError = require('../models/http-error')
//const suppliers = require('../models/suppliers')
const Admissions = require('../models/Admission')
const Admission = require('../models/Admission')
const Patients = require('../models/patient')

//Register Supplier

const AddPatient = async (req, res, next) => {
    // const { supplierDetails, adress } = req.body
    console.log("Admission Block")
    const newsupplier = new Admissions({
        ...req.body,
    })

    try {

        console.log(req.body,"body here")
        await newsupplier.save()
        console.log("Patinet is admitteds SuccessFully,triggering try-block")
    }
    catch (e) {
        console.log(e)
        console.log("Catch-block")
    }
    res.json("Patient admitted Successfully")

}

// GETTing Details

const GetAdmissions = async (req, res, next) => {
    // console.log("triggeing GET Admissions")
    let List;
    try {
        List = await Admissions.find({})
    }
    catch (e) {
        console.log(e)
    }
    res.json({ List })
}

// GET ID
const getId = async (req, res, next) => {
    let newAdId;
    let RoomsLength;
    const str = "0";

    console.log("Backend triggering to get ID");

    try {
        // Fetch all hospitals from the database
        const room = await Admissions.find({});

        if (room.length > 0) {
            // Get the last hospital document, sorted by _id in descending order
            const lastRoom = await Admissions.find({}).sort({ _id: -1 }).limit(1);

            // Extract the last hospital's hospitalId
            const lastRoomId = lastRoom[0].admissionId;

            // Calculate the next hospitalId based on the last one
            // Extract the numeric part of the last hospitalId (assuming the format is HP000001)
            const lastNumber = parseInt(lastRoomId.substring(2));  // Extracts the number part after 'HP'

            // Generate the next hospitalId (increment the last number)
            const nextNumber = lastNumber + 1;

            // Determine the number of leading zeros required for the new ID
            const zerosCount = 6 - nextNumber.toString().length;
            newRoomId = 'AD' + str.repeat(zerosCount) + nextNumber.toString();
        } else {
            // If no hospitals exist, create the first hospitalId
            newRoomId = 'AD' + '0'.repeat(5) + "1";  // HP000001
        }

        console.log("Generated Hospital ID:", newRoomId);
        res.json({ id: newRoomId });

    } catch (err) {
        console.log(err)

    }
};
// GET Details ById
const AdmissionDetailsById = async (req, res, next) => {
    const { Id } = req.params
    // console.log(Id)
    // console.log("Triggering")
    console.log(Id)
    let Admission
    try {
        // const url=`http://locolhost:5000/api/appointments/${Id}`
        Admission = await Admissions.findOne({ admissionId: Id })
        // console.log(Appointment)
        // console.log("triggering try-block")
        console.log(Admission)
    }
    catch (e) {
        console.log(e)
        // console.log("triggering catch-block")
    }
    res.json({ Admission })
}

const updateAddmissionStatus = async (req, res, next) => {

    try {
        console.log("Updation Admission status")
        console.log(req.params)
        const AdId = req.params.Id
        // console.log(StaffId,"here is")

        const admission = await Admissions.findOne({ admissionId: AdId })

        if (admission) {
            try {
                admission.status = req.body.status
                await admission.save()
                return res.status(200).json({ message: "Admission status updated successfully!" });

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


const getRegisterdPatients = async (req, res, next) => {
    let InvList;
    try {
        InvList = await Admissions.find({})
        console.log({
            registeredPatientList: InvList.map(e => ({
                name: e.admissionDetails.patientName
            }))
        })

        res.send({
            registeredPatientList: InvList.map(e => ({
                Id: e.admissionDetails.patientId
            }))

        })
    } catch (e) {
        console.log(e)
    }
}

const AdmissionByPatientId = async (req, res, next) => {
    const { Id } = req.params;
    console.log(Id, "patientId");

    try {
        const AdmittedPerson = await Admissions.find({ "patientName": Id });

        if (!AdmittedPerson || AdmittedPerson.length === 0) {
            return res.status(404).json({ ok: false, message: "No admission found for this patient" });
        }

        res.json({ ok: true, Admission: AdmittedPerson });
    } catch (error) {
        console.error(error);
        res.status(500).json({ ok: false, message: "Internal Server Error" });
    }
};

const addAdmissionFromExcel = async (req, res, next) => {
    let lastId, newId;

    function excelDateToJSDate(serialDate) {
        const jsonDate= new Date((serialDate - 25569) * 86400 * 1000);
        return jsonDate.toISOString().split("T")[0];
    }

    try {
        const totalItems = await Admission.countDocuments();
        if (totalItems > 0) {
            const last = await Admission.findOne().sort({ _id: -1 });
            lastId = last && last.admissionId ? parseInt(last.admissionId.slice(2)) : 0;
        } else {
            lastId = 0;
        }
        const prefix = "AD";
        const newNumber = lastId + 1;
        const paddedNumber = newNumber.toString().padStart(6, "0");
        newId = prefix + paddedNumber;
    } catch (err) {
        return next(new HttpError(`Creating Admission ID failed, please try again. ${err}`, 500));
    }
    console.log(req.body,"req.body")

    let {
        admissionid,
        patientname, // This is a full name from Excel
        reasonforadmission,
        admissiontype,
        patientid,
        roomnumber,
        roomtype,
        roomcharge,
        roomid,
        bloodpressure,
        heartrate,
        respiratoryrate,
        temparature,
        oxygenlevel,
        admissiondate,
        status,
    } = req.body;

    console.log("Received Patient Name:", patientname);

    // if (!patientname || !admissiontype || !admissiondate) {
    //     return res.status(400).json({ message: "Missing required patient details." });
    // }

    // 🔹 Split `patientname` into `firstName` and `lastName`
    

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

        // 🔹 Check if the patient already has an admission
        const existingAdmission = await Admission.findOne({ patientId: existingPatient._id });

        // 🔹 Create admission object
        const updateFields = {
            admissionId: existingAdmission ? existingAdmission.admissionId : newId,
            patientName: patientname,
            patientId: existingPatient._id, // Use the actual ID from the Patient collection
            reasonForAdmission: reasonforadmission || "",
            admissionType: admissiontype,
            roomNumber: roomnumber || "",
            roomType: roomtype || "",
            roomCharge: roomcharge || "",
            roomId: roomid || "",
            bloodPressure: bloodpressure || "",
            heartRate: heartrate || "",
            respiratoryRate: respiratoryrate || "",
            temparature: temparature || "",
            oxygenLevel: oxygenlevel || "",
            admissionDate:excelDateToJSDate( admissiondate), // is this returns exact date
            status: "Active",
        };

        // 🔹 Update existing admission or create a new one
        const updatedPatient = await Admission.findOneAndUpdate(
            { patientId: existingPatient._id },
            { $set: updateFields },
            { new: true, upsert: true }
        );
    

        res.status(200).json({ patient: updatedPatient });
    } 
    
    
    catch (err) {
        return next(new HttpError(`Saving admission failed, please try again. ${err}`, 500));
    }
};

const updateAdmission = async (req, res, next) => {
    console.log("triggering to update Admission")
    try {
        const { Id } = req.params; // Get admissionId from URL
        console.log(req.body); // Log request body to check the changes

        // Find and update the admission record
        const updatedAdmission = await Admissions.findOneAndUpdate(
            { admissionId: Id }, // Find by admissionId
            { $set: req.body },   // Update with new values from request
            { new: true, runValidators: true } // Return updated document, validate schema
        );

        // If no admission found, return error
        if (!updatedAdmission) {
            return res.status(404).json({ message: "Admission not found" });
        }

        res.status(200).json({ message: "Admission updated successfully", data: updatedAdmission });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error", error });
    }
};


exports.AddPatient = AddPatient
exports.GetAdmissions = GetAdmissions
exports.getId = getId
exports.AdmissionDetailsById = AdmissionDetailsById
exports.updateAddmissionStatus = updateAddmissionStatus
exports.getRegisterdPatients = getRegisterdPatients
exports.AdmissionByPatientId = AdmissionByPatientId
exports.updateAdmission = updateAdmission
exports.addAdmissionFromExcel = addAdmissionFromExcel