const HttpError = require('../models/http-error')
const { v4: uuid } = require("uuid")
const { validationResult } = require('express-validator')
const Patient = require('../models/patient')
const { get } = require('mongoose')
const { uploadFileToS3Bucket } = require('../models/s3Bucket')

// GET PATIENT BY ID
const getPatientById = async (req, res, next) => {
   console.log("Prabhuva")
   console.log(req.params,"@@@")
    let patient;
    try {
        patient = await Patient.findOne({ patientId: req.params.id, hospitalId: req.params.hospitalid })
        // console.log("triggering tryblock")
        console.log(patient, "patient") 
    }
    catch (err) {
        const error = new HttpError("Couldnot find the patient Having the Provided Id", 500)
        console.log("catch block")
        return next(error)
    }
    if (!patient) {
        const error = new HttpError('Could not find a patient for the Provided id.', 404)
        return next(error)

    }
    res.json({ patient: patient })
}

//GET Patients
const getPatients = async (req, res, next) => {
    const { hospitalId } = req.params
    console.log(req.params,"***")
    let patients
    try {
        patients = await Patient.find({ hospitalId:hospitalId })
        console.log(patients,"patients")
    } catch (err) {
        console.log(err)
        const error = new HttpError("not getting a patient", 402)
        return next(error)
    }

    res.json({ patient: patients.map(e => e.toObject({ getters: true })) })
};

// GetId

const getId = async (req, res, next) => {
    let newPatientId;
    let ZerosCount;
    let PatientLength;
    const str = "0";
    const { hospitalId } = req.params  // String used for padding zeros

    try {
        // Fetch all patients from the database
        const Patients = await Patient.find({ hospitalId });
        // console.log("Current number of patients:", Patients.length);
        // console.log(Patients)
        // If there are existing patients, generate the new patient ID based on the count
        if (Patients.length > 0) {
            const lastPatient = await Patient.find({ hospitalId }).sort({ _id: -1 }).limit(1);
            const lastNumber = parseInt(lastPatient[0].patientId.substring(2))
            const nextNumber = lastNumber + 1;
            PatientLength = Patients.length;
            ZerosCount = 6 - nextNumber.toString().length;

            newPatientId = 'PA' + str.repeat(ZerosCount) + nextNumber.toString();
        }
        else {
            newPatientId = 'PA' + '0'.repeat(5) + "1";
        }
        // console.log("Generated New Patient ID:", newPatientId);

        res.json({ id: newPatientId });
    } catch (err) {
        // Handle any errors
        const error = new HttpError("Couldn't Fetch the Patient Details", 500);
        return next(error);
    }

};


//CREATING PLACE
const createPatient = async (req, res, next) => {
    try {
        const { email, ...updateData } = req.body; // Extract email from request body
        let existingPatient = await Patient.findOne({ email });
        if (existingPatient) {
            await Patient.findByIdAndUpdate(existingPatient._id, updateData, { new: true });
            return res.status(200).json({ message: "Patient updated successfully", patientId: existingPatient._id });
        } else {
            const newPatient = new Patient(req.body);
            await newPatient.save();
            console.log("Patient Registered Succesfully")
            return res.status(201).json({ message: "Patient created successfully", patientId: newPatient._id });
        }
    } catch (err) {
        console.log(err, "error")
        console.error("Error in createPatient:", err);
        return next(new HttpError("Error processing patient request", 500));
    }
};

// UPDATE Patient
const updatePatient = async (req, res, next) => {
    // console.log("triggering update block")
    const {
        patientDetails,
        emergencyContactDetails,
        adress,
        insurance,
        medicalHistory,
        ReasonsForVisit,
        TermsConditions,
        prefferedCommunications
    } = req.body;

    const { id } = req.params
    // console.log(req.body)

    let patient;
    try {
        patient = await Patient.findOne({ staffId: id })
        // console.log(patient)
    }
    catch (err) {
        const error = new HttpError("Can not find a place by provided place id", 500)
        console.log({ err })
        // console.log(error)
        return next(error)
    }
    try {
        patient.patientDetails = patientDetails
        patient.emergencyContactDetails = emergencyContactDetails
        patient.adress = adress
        patient.insurance = insurance
        patient.medicalHistory = medicalHistory
        patient.ReasonsForVisit = ReasonsForVisit
        patient.TermsConditions = TermsConditions
        patient.prefferedCommunications = prefferedCommunications
        patient.save()
    }
    catch (err) {
        const error = new HttpError("couldnt Updated", 500)
        return next(error)

    }

    res.status(200).json({ patients: patient.toObject({ getters: true }) })
}

//DELETE PLACE
const deletePatient = async (req, res, next) => {
    const patientId = req.params.id

    let patient;
    try {
        patient = await Place.findById(placeId)
    }
    catch (e) {
        const error = new HttpError("Coundn't find the patient with the fallowing Id", 500)
        next(error)
    }
    try {
        await patient.remove()
    } catch (e) {
        const error = new HttpError("Coundn't remove the place", 500)
        next(error)
    }

    res.status(200).json(({ patient: "Deleted Place" }))
}

const updatePatientStatus = async (req, res, next) => {
    try {
        // console.log("Updation status")
        const PatientId = req.params.Id
        const patient = await Patient.findOne({ patientId: PatientId })
        if (patient) {
            try {
                patient.status = req.body.status
                await patient.save()
                return res.status(200).json({ message: "Patient status updated successfully!" });

            } catch (e) {
                console.log(e)
            }
        }
    }
    catch (e) {
        console.log(e)
    }
}


const AddAppointment = async (req, res, next) => {
    try {
        const { Id } = req.params; // Patient ID from URL
        const { appointmentDate, doctor, department, reason } = req.body;
        console.log(req.body, "req.body")// Appointment details

        // Find patient by ID
        let patient = await Patient.findOne({ "patientId": Id })
        if (!patient) {
            return res.status(404).json({ message: "Patient not found" });
        }

        // Create new appointment object
        const newAppointment = {
            ...req.body

        };

        // Add appointment to patient's record
        if (!patient.appointments) {
            patient.appointments = []; // Ensure array exists
        }
        patient.appointments.push(newAppointment);

        // Save updated patient record
        await patient.save();

        res.status(200).json({ message: "Appointment added successfully", patient });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
}


const AddReport = async (req, res, next) => {
    try {
        const { Id } = req.params; // Patient ID from URL
        const { appointmentDate, doctor, department, reason } = req.body;

        // Find patient by ID
        let patient = await Patient.findOne({ "patientId": Id })
        if (!patient) {
            return res.status(404).json({ message: "Patient not found" });
        }

        const newAppointment = {
            ...req.body

        };

        // Add appointment to patient's record
        if (!patient.appointments) {
            patient.appointments = []; // Ensure array exists
        }
        patient.appointments.push(newAppointment);

        // Save updated patient record
        await patient.save();

        res.status(200).json({ message: "Appointment added successfully", patient });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
}



const addPatientFromExcel = async (req, res, next) => {
    function excelDateToJSDate(serialDate) {
        const date = new Date((serialDate - 25569) * 86400 * 1000);
        return date.toISOString().split("T")[0];
    }
    let {
        firstname = "",
        lastname = "",
        dateofbirth = "",
        gender = "",
        email = "",
        contactnumber = "",
        emergencycontactname = "",
        emergencycontactnumber = "",
        street = "",
        city = "",
        state = "",
        zipcode = "",
        insuranceprovider = "",
        policynumber = "",
        policyholdersname = "",
        relation = "",
        currentmedicine = "",
        previoussurgeries = "",
        chronicconditions = "",
        reasonsforvisit = "",
        status = "Active",
    } = req.body;

    try {
        // Check if a patient with the provided email exists
        let existingPatient = await Patient.findOne({ email });
        let patientId;
        if (existingPatient) {
            // Use the existing patientId if found
            patientId = existingPatient.patientId;
        } else {
            // Generate a new patient ID if not found
            const totalItems = await Patient.countDocuments();
            let lastId;

            if (totalItems > 0) {
                const last = await Patient.findOne().sort({ _id: -1 });
                lastId = parseInt(last.patientId.slice(2));
            } else {
                lastId = 0;
            }

            const prefix = "PA";
            const newNumber = lastId + 1;
            const paddedNumber = newNumber.toString().padStart(6, "0");
            patientId = prefix + paddedNumber;
        }
        const updatedPatient = await Patient.findOneAndUpdate(
            { email: email },
            {
                $set: {
                    patientId: patientId, // Assign the correct patientId
                    firstName: firstname,
                    LastName: lastname,
                    dateOfBirth: excelDateToJSDate(dateofbirth),
                    gender: gender,
                    contactNumber: contactnumber,
                    emergencyContactName: emergencycontactname,
                    emergencyContactNumber: emergencycontactnumber,
                    street: street,
                    city: city,
                    state: state,
                    zipcode: zipcode,
                    insuranceProvider: insuranceprovider,
                    policyNumber: policynumber,
                    policyHoldersName: policyholdersname,
                    relation: relation,
                    currentMedicine: currentmedicine,
                    previousSurgeries: previoussurgeries,
                    chronicConditions: chronicconditions,
                    reasonsForVisit: reasonsforvisit,
                    status: status,
                }
            },
            { new: true, upsert: true } // Return updated document; create if not exists
        );

        res.status(200).json({ patient: updatedPatient });
    } catch (err) {
        return next(new HttpError(`Saving patient failed, please try again. ${err}`, 500));
    }
};

// generating url
const generateNoteUrl = async (req, res, next) => {
    try {
        // console.log(req.file,'this si the file')
        // console.log(req.body,"body")
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "No file provided",
            });
        }

        // console.log(req.file,"file @backend")
        // console.log(req.body,"body")
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
            name: req.file.originalname
        });
    } catch (error) {
        console.error("Error uploading File:", error);
        return res.status(500).json({
            success: false,
            message: "Error uploading File, try again.",
        });
    }
};

const getPatientChartData = async (req, res, next) => {
    const categoryColors = {
        "EmergencyAdmission": "rgba(244, 67, 54, 1)", // Red
        "Normal": "rgba(76, 175, 80, 1)", // Green
        "General": "rgba(33, 150, 243, 1)" // Blue
    };

    try {
        const patientData = await Patient.aggregate([
            {
                $group: {
                    _id: {
                        category: "$category",
                        registeredMonth: { $month: "$registeredOn" } // Extract month from registeredOn
                    },
                    totalCount: { $sum: 1 } // Count number of patients
                }
            },
            {
                $group: {
                    _id: "$_id.category",
                    data: {
                        $push: {
                            month: "$_id.registeredMonth",
                            totalCount: "$totalCount"
                        }
                    }
                }
            }
        ]);

        const allLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

        let maxMonth = 0; // Track the latest month with data

        const datasets = patientData.map(categoryData => {
            const monthData = new Array(12).fill(0);

            categoryData.data.forEach(entry => {
                monthData[entry.month - 1] = entry.totalCount; // Adjust for zero-based index
                if (entry.month > maxMonth) {
                    maxMonth = entry.month; // Track latest month with data
                }
            });

            return {
                label: categoryData._id, // Category name
                data: monthData.slice(0, maxMonth), // Trim data up to latest month
                borderColor: categoryColors[categoryData._id] || "rgba(0, 0, 0, 1)", // Default black
                backgroundColor: categoryColors[categoryData._id]?.replace("1)", "0.3)") || "rgba(0, 0, 0, 0.3)" // Lighter background
            };
        });

        const labels = allLabels.slice(0, maxMonth);

        res.json({ labels, datasets });
    } catch (error) {
        console.error("Error fetching patient registration chart data:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

const checkEmailAndSendName=async(req,res,next)=>{
    const {email,hospital} = req.params
    console.log(req.params)
        try {
            const patient = await Patient.findOne({ email: email,hospitalId:hospital})
            res.json({ patient })
        }
        catch (e) {
            console.log(e)
        }
}




exports.getPatientById = getPatientById
exports.getPatients = getPatients
exports.createPatient = createPatient
exports.updatePatient = updatePatient
exports.deletePatient = deletePatient
exports.getId = getId
exports.updatePatientStatus = updatePatientStatus
exports.AddAppointment = AddAppointment
exports.AddReport = AddReport
exports.addPatientFromExcel = addPatientFromExcel
exports.generateNoteUrl = generateNoteUrl
exports.getPatientChartData = getPatientChartData
exports.checkEmailAndSendName = checkEmailAndSendName