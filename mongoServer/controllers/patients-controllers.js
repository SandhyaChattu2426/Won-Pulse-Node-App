const HttpError = require('../models/http-error')
const { v4: uuid } = require("uuid")
const { validationResult } = require('express-validator')
const Patient = require('../models/patient')
const { get } = require('mongoose')
// GET PATIENT BY ID
const getPatientById = async (req, res, next) => {
    console.log('GET Request fro particular  patient ID')
    const patientId = req.params.Id
    console.log(req.params,
        "params here"
    )
    let patient;

    try {
        patient = await Patient.find({ patientId: patientId })
        // console.log("triggering tryblock")
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
    console.log(patient,"patient")

    res.json({ patients: patient })
}

//GET Patients
const getPatients = async (req, res, next) => {

    let patients
    console.log("Getting Patients")
    try {
        patients = await Patient.find({})
        // console.log(patients)
    } catch (err) {
        console.log(err)
        const error = new HttpError("not getting a patient", 402)
        return next(error)
    }

    res.json({ patient: patients.map(e => e.toObject({ getters: true })) })
};

// GetId

const getId = async (req, res, next) => {
    let newPatient;
    let newPatientId;
    let ZerosCount;
    let PatientLength;
    const str = "0";  // String used for padding zeros
    console.log("Backend Triggering to Get Patient Id");

    try {
        // Fetch all patients from the database
        const Patients = await Patient.find({});
        // console.log("Current number of patients:", Patients.length);
        console.log(Patients)
        // If there are existing patients, generate the new patient ID based on the count
        if (Patients.length > 0) {
            const lastPatient = await Patient.find({}).sort({ _id: -1 }).limit(1);
            const lastNumber = parseInt(lastPatient[0].patientId.substring(2))
            console.log(lastNumber, "lastNumber")
            const nextNumber = lastNumber + 1;
            PatientLength = Patients.length;
            ZerosCount = 6 - nextNumber.toString().length;

            // Generate new patient ID (e.g., PA000001, PA000002, ...)
            newPatientId = 'PA' + str.repeat(ZerosCount) + nextNumber.toString();
        }
        else {
            // If no patients exist, start with PA000001
            newPatientId = 'PA' + '0'.repeat(5) + "1";
        }

        console.log("Generated New Patient ID:", newPatientId);

        // Send the new patient ID in the response
        res.json({ id: newPatientId });
    } catch (err) {
        // Handle any errors
        const error = new HttpError("Couldn't Fetch the Patient Details", 500);
        return next(error);
    }

    // Create the new patient object (you should replace the mock data with real data from the request body)
    // newPatient = new Patient({
    //     patientId:newPatientId,
    //     patientDetails: {
    //         firstName: "John", // Example data, replace with request data
    //         lastName: "Doe",  // Example data
    //         DateOfBirth: "1990-01-01", // Example data
    //         gender: "Male",  // Example data
    //     },
    //     emergencyContactDetails: {
    //         firstName: "Jane",  // Example data
    //         lastName: "Doe",  // Example data
    //         contactNumber: "1234567890"  // Example data
    //     },
    //     adress: {
    //         street: "123 Main St",  // Example data
    //         city: "Cityville",  // Example data
    //         state: "State",  // Example data
    //         pincode: "123456",  // Example data
    //     },
    //     insurance: {
    //         insuranceProvider: "HealthIns",  // Example data
    //         policyHolder: "John Doe",  // Example data
    //         policyHoldersName: "John Doe",  // Example data
    //         relation: "Self",  // Example data
    //     },
    //     medicalHistory: {
    //         currentMedicine: "Aspirin",  // Example data
    //         previousSurgeries: "Appendectomy",  // Example data
    //         chronicConditions: "None",  // Example data
    //     },
    //     ReasonsForVisit: "Routine checkup",  // Example data
    //     preferredCommunications: ['sms', 'email'],  // Example data
    // });

    // try {
    //     // Save the new patient to the database
    //     await newPatient.save();
    //     console.log("New patient saved successfully.");
    // } catch (e) {
    //     // Log error if saving the patient fails
    //     console.log("Error saving patient:", e);
    // }
};


//CREATING PLACE
const createPatient = async (req, res, next) => {
    console.log("triggering @")
    try {
        const { email, ...updateData } = req.body; // Extract email from request body

        // Check if a patient with this email already exists
        console.log(req.body,"body")
        let existingPatient = await Patient.findOne({ email });

        if (existingPatient) {
            // If patient exists, update their details
            await Patient.findByIdAndUpdate(existingPatient._id, updateData, { new: true });
            console.log("Existing patient updated:", existingPatient._id);
            return res.status(200).json({ message: "Patient updated successfully", patientId: existingPatient._id });
        } else {
            // If no patient exists, create a new one
            const newPatient = new Patient(req.body);
            await newPatient.save();
            console.log("New patient created:", newPatient._id);
            return res.status(201).json({ message: "Patient created successfully", patientId: newPatient._id });
        }
    } catch (err) {
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
        console.log(patient)
    }
    catch (err) {
        const error = new HttpError("Can not find a place by provided place id", 500)
        console.log({ err })
        console.log(error)
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
        console.log("catch-block")
        return next(error)

    }

    res.status(200).json({ patients: patient.toObject({ getters: true }) })
}

//DELETE PLACE
const deletePatient = async (req, res, next) => {
    const patientId = req.params.id

    //console.log(DUMMY_PLACES)
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

//Update Patient Status
const updatePatientStatus = async (req, res, next) => {
    try {
        // console.log("Updation status")
        const PatientId = req.params.Id
        console.log(PatientId, "here is")
        const patient = await Patient.findOne({ patientId: PatientId })
        console.log(patient)
        if (patient) {
            try {
                patient.status = req.body.status
                await patient.save()
                return res.status(200).json({ message: "Patient status updated successfully!" });

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


const AddAppointment = async (req, res, next) => {
    console.log("Triggering By Lords Grace to include appointment")
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
    console.log("Triggering By Lords Grace to include report")
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


// const addPatientFromExcel = async (req, res, next) => {
//     // console.log("Triggering here")
//     let last, lastId, newId;
//     let createdItem;

//     try {
//         const totalItems = await Patient.countDocuments();
//         if (totalItems > 0) {
//             last = await Patient.findOne().sort({ _id: -1 });
//             lastId = parseInt(last.patientId.slice(2));
//             console.log(lastId, "lastid")
//         } else {
//             lastId = 0;
//         }

//         const prefix = "PA";
//         const newNumber = lastId + 1;
//         const paddedNumber = newNumber.toString().padStart(6, "0");
//         newId = prefix + paddedNumber;
//         console.log(newId)
//     } catch (err) {
//         return next(new HttpError(`Creating report ID failed, Please try again. ${err}`, 500));
//     }

//     // Validate inputs
//     // const errors = validationResult(req);
//     // if (!errors.isEmpty()) {
//     //     return next(new HttpError("Invalid inputs passed, please check your data", 422));
//     // }

//     console.log(req.body, "request")
//     // let {
//     //     staffId:req.body.,
//     //     fullName:req.body.,
//     //     dateOfBirth:req.body.,
//     //     gender:req.body.,
//     //     email:req.body.,
//     //     contactNumber:req.body.,
//     //     street:req.body.,
//     //     city:req.body.,
//     //     state:req.body.,
//     //     zipcode:req.body.,
//     //     jobRole:req.body.,
//     //     department:req.body.,
//     //     employmentType:req.body.,
//     //     qualification:req.body.,
//     //     nightShift:req.body.,
//     //     online:req.body.,
//     //     status:req.body.,

//     // } = req.body;


//     //  try {
//     //     let existingItem;

//     //     // ✅ 1️⃣ Check for existing item using `item_id`
//     //     if (req.body.reportId) {
//     //         existingItem = await Reports.findOne({ item_id });
//     //     }

//     //     if (existingItem) {
//     //         // ✅ Update existing item by `item_id`
//     //         const updatedItem = await Reports.findOneAndUpdate(
//     //             { item_id },
//     //             { $set: req.body },
//     //             { new: true }
//     //         );

//     //         return res.status(200).json({
//     //             message: "Item updated successfully.",
//     //             updatedItem,
//     //         });
//     //     } else {
//     //         // ✅ 2️⃣ If no `item_id`, check for existing item by `item_category` and `item_brand`
//     //         existingItem = await Reports.findOne({
//     //             item_name,
//     //             item_brand,
//     //         });

//     //         if (existingItem) {
//     //             // ✅ If found, update the existing record
//     //             const updatedItem = await Reports.findOneAndUpdate(
//     //                 { item_name, item_brand },
//     //                 { $set: req.body },
//     //                 { new: true }
//     //             );

//     //             return res.status(200).json({
//     //                 message: "Item updated successfully.",
//     //                 updatedItem,
//     //             });
//     //         }
//     //     }
//     // } catch (err) {
//     //     return next(new HttpError(`Error checking for existing item: ${err}`, 500));
//     // }

//     // Create a new inventory item
//     const existingStaff = await Patient.findOne({ email: req.body.email });  // You can use email or staffId for uniqueness
//     if (existingStaff) {
//         return res.status(400).json({ message: "Patient already with this email already exists." });
//     }
    


//     createdItem = new Patient({
//         patientId: newId,
//         firstName: req.body.firstname,
//         LastName: req.body.lastname,
//         dateOfBirth: req.body.dateofbirth,
//         gender: req.body.gender,
//         email: req.body.email,
//         contactNumber: req.body.contactnumber,
//         emergencyContactName: req.body.emergencycontactname,
//         emergencyContactNumber: req.body.emergencycontactnumber,
//         street: req.body.street,
//         city: req.body.city,
//         state: req.body.state,
//         zipcode: req.body.zipcode,
//         insuranceProvider: req.body.insuranceprovider,
//         policyNumber: req.body.policynumber,
//         policyHoldersName: req.body.policyholdersname,
//         relation: req.body.relation,
//         currentMedicine: req.body.currentmedicine,
//         previousSurgeries: req.body.previoussurgeries,
//         chronicConditions: req.body.chronicconditions,
//         reasonsForVisit: req.body.reasonsforvisit,
//         status: req.body.status || "Active",
//     });
//     if (!req.body.firstname || !req.body.dateofbirth || !req.body.gender || !req.body.lastname || !req.body.contactnumber || !req.body.city ) {
//         return res.status(400).send({ message: "Incomplete Patient details." });
//     }
//     else {
//         try {
//             // const sess = await mongoose.startSession();
//             // sess.startTransaction();
//             // await createdItem.save({ session: sess });
//             // await sess.commitTransaction();
//             // sess.endSession();

//             await createdItem.save()
//             res.status(201).json({ item: createdItem });
//         } catch (err) {
//             return next(new HttpError(`Creating item failed, Please try again. ${err}`, 500));
//         }
//     }
// }
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

    console.log(req.body,"body Here");

    // if (!firstname || !lastname || !dateofbirth || !gender || !contactnumber ) {
    //     return res.status(400).send({ message: "Incomplete patient details." });
    // }

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
        console.log(req.body.contactnumber,"num")
        // Create or update the patient record
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