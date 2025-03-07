const HttpError = require('../models/http-error')

const { v4: uuid } = require("uuid")
const { validationResult } = require('express-validator')

const Staff = require('../models/staff')
const { request } = require('express')

// CreateStaff
const createStaff = async (req, res, next) => {
    const newStaff = new Staff({ ...req.body });
    try {
        await newStaff.save();
        return res.status(201).json({ message: "Staff created successfully" }); // Send JSON response
    } catch (e) {
        console.log(e);
        return res.status(500).json({ error: "Cannot create staff" }); // Return proper JSON response
    }
};

//Get All Staff In Database
const getStaff = async (req, res, next) => {
    let staff;

    try {
        staff = await Staff.find({})
        // console.log(staff)
    }
    catch (e) {
        console.log(e)
        return next(new HttpError("can not Getting Staff", 500))
    }
    // console.log(staff)

    res.json({ staff: staff.map(e => e.toObject({ getters: true })) })
}
// Creating StaffId
const getId = async (req, res, next) => {
    let newPatient;
    let newPatientId;
    let ZerosCount;
    let PatientLength;
    const str = "0";  // String used for padding zeros
    console.log("Backend Triggering to Get Patient Id");

    try {
        // Fetch all patients from the database
        const Patients = await Staff.find({});
        // console.log("Current number of patients:", Patients.length);
        console.log(Patients)
        // If there are existing patients, generate the new patient ID based on the count
        if (Patients.length > 0) {
            const lastPatient = await Staff.find({}).sort({ _id: -1 }).limit(1);
            const lastNumber = parseInt(lastPatient[0].staffId.substring(2))
            console.log(lastNumber, "lastNumber")
            const nextNumber = lastNumber + 1;
            PatientLength = Patients.length;
            ZerosCount = 6 - nextNumber.toString().length;

            // Generate new patient ID (e.g., PA000001, PA000002, ...)
            newPatientId = 'ST' + str.repeat(ZerosCount) + nextNumber.toString();
        }
        else {
            // If no patients exist, start with PA000001
            newPatientId = 'ST' + '0'.repeat(5) + "1";
        }

        console.log("Generated New Patient ID:", newPatientId);

        // Send the new patient ID in the response
        res.json({ id: newPatientId });
    } catch (err) {
        // Handle any errors
        const error = new HttpError("Couldn't Fetch the Patient Details", 500);
        return next(error);
    }
};

//Get Staff By Id
const getStaffById = async (req, res, next) => {
    const staffId = req.params.id
    //console.log(req.params.id)
    try {
        const staffMember = await Staff.find({ staffId: staffId })
        // console.log(staffMember)
        // console.log("try-block")
        res.json({ staffMember })
    }
    catch (e) {
        console.log(e)
        console.log("catch-block")
    }
}

const updateStaff = async (req, res, next) => {
    const { staffId, personalInformation, adress, qualification, typeOfStaff } = req.body
    //    console.log(req.params)
    const { id } = req.params
    console.log(id)
    console.log("triggering IN the Backend")
    let staff;
    try {
        // staff=await Staff.find({staffId:id})
        staff = await Staff.findOne({ staffId: id })
        console.log(staff)

    } catch (e) {
        console.log(e)
        return new HttpError("can not find staff", 404)
    } try {
        staff.id = staffId
        staff.personalInformation = personalInformation
        staff.adress = adress
        staff.qualification = qualification
        staff.typeOfStaff = typeOfStaff
        await staff.save()
        // console.log("saving")
    } catch (e) {
        console.log("not")
        console.log(e)
        return new HttpError("can't be updated")

    }

    res.status(200).json({ staff: staff.toObject({ getters: true }) })
}

const updateStaffStatus = async (req, res, next) => {
    try {
        console.log("Updation Staff status")
        const StaffId = req.params.Id
        console.log(StaffId, "here is")
        const staff = await Staff.findOne({ staffId: StaffId })
        console.log(staff)
        if (staff) {
            try {
                staff.status = req.body.status
                await staff.save()
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


const addStaffFromExcel = async (req, res, next) => {
    try {
        const {
            fullname,
            dateofbirth,
            gender,
            email,
            contactnumber,
            street,
            city,
            state,
            zipcode,
            jobrole,
            department,
            employmenttype,
            qualification,
            nightshift,
            online,
            status,
        } = req.body;

        // Validate required fields
        if (!fullname || !dateofbirth || !gender || !contactnumber || !email) {
            return res.status(400).send({ message: "Incomplete staff details." });
        }

        // Check if the staff member already exists by email
        let staff = await Staff.findOne({ email });
        console.log(staff,"oldItem")

        if (staff) {
            // Staff exists, update their details without changing staffId
            staff.fullName = fullname;
            staff.dateOfBirth = dateofbirth;
            staff.gender = gender;
            staff.contactNumber = contactnumber;
            staff.street = street;
            staff.city = city;
            staff.state = state;
            staff.zipcode = zipcode;
            staff.jobRole = jobrole;
            staff.department = department;
            staff.employmentType = employmenttype;
            staff.qualification = qualification;
            staff.nightShift = nightshift;
            staff.online = online;
            staff.status = status || "Active";

            await staff.save();
            console.log("triggering update")
            return res.status(200).json({ message: "Staff details updated successfully.", staff });
        } else {
            // Staff does not exist, create a new staff record

            // Generate a new staffId
            const totalItems = await Staff.countDocuments();
            const lastStaff = totalItems > 0 ? await Staff.findOne().sort({ _id: -1 }) : null;
            const lastId = lastStaff ? parseInt(lastStaff.staffId.slice(2)) : 0;
            const newId = `ST${(lastId + 1).toString().padStart(6, "0")}`;

            // Create new staff
            const newStaff = new Staff({
                staffId: newId,
                fullName: fullname,
                dateOfBirth: dateofbirth,
                gender: gender,
                email: email,
                contactNumber: contactnumber,
                street: street,
                city: city,
                state: state,
                zipcode: zipcode,
                jobRole: jobrole,
                department: department,
                employmentType: employmenttype,
                qualification: qualification,
                nightShift: nightshift,
                online: online,
                status: status || "Active",
            });

            await newStaff.save();
            return res.status(201).json({ message: "Staff created successfully.", staff: newStaff });
        }
    } catch (err) {
        return next(new HttpError(`Operation failed, please try again. ${err}`, 500));
    }
};

const getStaffByHplId=async (req,res,next)=>{  
    console.log("triggering") 
    const {Id}=req.params
    console.log(Id,"Id here")
    try{
    const staffMembers= await Staff.find({hospitalId:Id})
    console.log(staffMembers,"sm")
    res.json({staff:staffMembers})
    }
    catch(e){
        console.log(e)
    }
}

const checkEmail=async(req,res,next)=>{
    const staffemail = req.params.email
    //console.log(req.params.id)
    try {
        const staffMember = await Staff.find({ email: staffemail })
        // console.log(staffMember)
        // console.log("try-block")
        res.json({ staffMember })
    }
    catch (e) {
        console.log(e)
        console.log("catch-block")
    }
}




exports.getStaff = getStaff
exports.createStaff = createStaff
exports.getId = getId
exports.getStaffById = getStaffById
exports.updateStaff = updateStaff
exports.updateStaffStatus = updateStaffStatus
exports.addStaffFromExcel = addStaffFromExcel
exports.getStaffByHplId=getStaffByHplId
exports.checkEmail=checkEmail
