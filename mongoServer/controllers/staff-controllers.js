const HttpError = require('../models/http-error')

const { v4: uuid } = require("uuid")
const { validationResult } = require('express-validator')

const Staff = require('../models/staff')
const HospitalFunction = require('./patients-controllers')
const { request } = require('express')
const path = require("path");

const fs = require("fs");
const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

const sendConfirmation = async (patient) => {
    const { staffId, fullName, hospitalId, email } = patient
    const emailTemplatePath = path.join(
        __dirname,
        "..",
        "EmailTemplates",
        "StaffAfterRegistration.html"
    );
    let emailTemplate = fs.readFileSync(emailTemplatePath, "utf-8");
    const hospital = await HospitalFunction.GetHospitalDetails(hospitalId)
    console.log(hospital, "hospital")
    const url = `${process.env.ALLOWEDURLS}/staff/${staffId}/hospital/${hospitalId}`
    emailTemplate = emailTemplate
        .replace(/{{hospital_name}}/g, hospital.hospitalName || "WON PULSE")
        .replace(/{{staff_name}}/g, fullName || "WON PULSE")
        .replace(/{{navigation_url}}/g, url)
        .replace(/{{mobile}}/g, hospital.mobile)
        .replace(/{{email}}/g, hospital.email)
        .replace(/{{adress}}/g, hospital.adress)
        ;
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: "WONPULSE:  You're Almost In! Complete Your Hospital Registration",
        html: emailTemplate,
    };
    return transporter.sendMail(mailOptions);
};

// CreateStaff
const createStaff = async (req, res, next) => {
    const newStaff = new Staff({ ...req.body });
    try {
        await newStaff.save();
        await sendConfirmation(newStaff);
        return res.status(201).json({ message: "Staff created successfully" }); // Send JSON response
    } catch (e) {
        console.log(e);
        return res.status(500).json({ error: "Cannot create staff" }); // Return proper JSON response
    }
};

//Get All Staff In Database
const getStaff = async (req, res, next) => {
    let staff;
    const { hospitalId } = req.params
    try {
        staff = await Staff.find({ hospitalId: hospitalId })
    }
    catch (e) {
        console.log(e)
        return next(new HttpError("can not Getting Staff", 500))
    }
    res.json({ staff: staff.map(e => e.toObject({ getters: true })) })
}
// Creating StaffId
const getId = async (req, res, next) => {
    let newPatientId;
    let ZerosCount;
    const str = "0";
    const { hospitalId } = req.params

    try {
        const Patients = await Staff.find({ hospitalId });
        // console.log(Patients)
        if (Patients.length > 0) {
            const lastPatient = await Staff.find({ hospitalId }).sort({ _id: -1 }).limit(1);
            const lastNumber = parseInt(lastPatient[0].staffId.substring(2))
            const nextNumber = lastNumber + 1;
            PatientLength = Patients.length;
            ZerosCount = 6 - nextNumber.toString().length;
            newPatientId = 'ST' + str.repeat(ZerosCount) + nextNumber.toString();
        }
        else {
            newPatientId = 'ST' + '0'.repeat(5) + "1";
        }
        res.json({ id: newPatientId });
    } catch (err) {
        const error = new HttpError("Couldn't Fetch the Patient Details", 500);
        return next(error);
    }
};

//Get Staff By Id
const getStaffById = async (req, res, next) => {
    // console.log(req.params)
    try {
        const staffMember = await Staff.find({ staffId: req.params.id, hospitalId: req.params.hospitalId })
        res.json({ staffMember })
    }
    catch (e) {
        console.log(e)
    }
}

const updateStaff = async (req, res, next) => {
    const { id, hospitalid } = req.params;
    const updateFields = {
        fullName: req.body.fullName,
        dateOfBirth: req.body.dateOfBirth,
        gender: req.body.gender,
        email: req.body.email,
        contactNumber: req.body.contactNumber,
        street: req.body.street,
        city: req.body.city,
        state: req.body.state,
        zipcode: req.body.zipcode,
        jobRole: req.body.jobRole,
        department: req.body.department,
        employmentType: req.body.employmentType,
        qualification: req.body.qualification,
        nightShift: req.body.nightShift,
        doctorType: req.body.doctorType,
        online: req.body.online,
        homeCare: req.body.homeCare,
        doctor_appointments: req.body.doctor_appointments,
        status: req.body.status
    };

    try {
        const updatedStaff = await Staff.findOneAndUpdate(
            { staffId: id, hospitalId: hospitalid },
            { $set: updateFields },
            { new: true, runValidators: true }
        );

        if (!updatedStaff) {
            return res.status(404).json({ message: "Staff not found." });
        }

        return res.status(200).json({
            message: "Staff updated successfully",
            staff: updatedStaff.toObject({ getters: true }),
        });

    } catch (error) {
        console.error("Error updating staff:", error);
        return res.status(500).json({ message: "Something went wrong while updating staff." });
    }
};


const updateStaffStatus = async (req, res, next) => {
    try {
        const StaffId = req.params.Id
        const staff = await Staff.findOne({ staffId: StaffId })
        if (staff) {
            try {
                staff.status = req.body.status
                await staff.save()
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
        if (!fullname || !dateofbirth || !gender || !contactnumber || !email) {
            return res.status(400).send({ message: "Incomplete staff details." });
        }
        let staff = await Staff.findOne({ email });
        if (staff) {
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
            const totalItems = await Staff.countDocuments();
            const lastStaff = totalItems > 0 ? await Staff.findOne().sort({ _id: -1 }) : null;
            const lastId = lastStaff ? parseInt(lastStaff.staffId.slice(2)) : 0;
            const newId = `ST${(lastId + 1).toString().padStart(6, "0")}`;
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

const getStaffByHplId = async (req, res, next) => {
    const { Id } = req.params
    try {
        const staffMembers = await Staff.find({ hospitalId: Id })
        res.json({ staff: staffMembers })
    }
    catch (e) {
        console.log(e)
    }
}

const checkEmail = async (req, res, next) => {
    const staffemail = req.params.email
    try {
        const staffMember = await Staff.find({ email: staffemail })
        res.json({ staffMember })
    }
    catch (e) {
        console.log(e)
    }
}

const getStaffChartData = async (req, res, next) => {

    const departmentColors = {
        "Cardiology": "rgba(244, 67, 54, 1)", // Red
        "Neurology": "rgba(33, 150, 243, 1)", // Blue
        "Orthopedics": "rgba(76, 175, 80, 1)", // Green
        "General Medicine": "rgba(255, 167, 38, 1)", // Orange
        "Pediatrics": "rgba(149, 125, 205, 1)" // Purple
    };

    try {
        const staffData = await Staff.aggregate([
            {
                $group: {
                    _id: {
                        department: "$department",
                        registeredMonth: { $month: "$registeredOn" } // Extract month from registeredOn
                    },
                    totalCount: { $sum: 1 } // Count number of staff members
                }
            },
            {
                $group: {
                    _id: "$_id.department",
                    data: {
                        $push: {
                            month: "$_id.registeredMonth",
                            totalCount: "$totalCount"
                        }
                    }
                }
            }
        ])
        const allLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

        let maxMonth = 0;
        const datasets = staffData.map(departmentData => {
            const monthData = new Array(12).fill(0);

            departmentData.data.forEach(entry => {
                monthData[entry.month - 1] = entry.totalCount; // Adjust for zero-based index
                if (entry.month > maxMonth) {
                    maxMonth = entry.month;
                }
            });

            return {
                label: departmentData._id,
                data: monthData.slice(0, maxMonth), // Trim data up to latest month
                borderColor: departmentColors[departmentData._id] || "rgba(0, 0, 0, 1)", // Default black
                backgroundColor: departmentColors[departmentData._id]?.replace("1)", "0.3)") || "rgba(0, 0, 0, 0.3)" // Lighter background
            };
        });
        const labels = allLabels.slice(0, maxMonth);
        res.json({ labels, datasets });
    } catch (error) {
        console.error("Error fetching staff registration chart data:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

const getStaffByRoleName = async (req, res, next) => {
    const { hospitalId, roleName } = req.params;
    try {
        const staffMembers = await Staff.find({ hospitalId, jobRole: roleName });
        if (!staffMembers.length) {
            return res.status(404).json({ message: "No staff members found" });
        }
        res.status(200).json(staffMembers);
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: "Server error", error: e.message }); // ✅ Handle errors properly
    }
};

const getStaffByRoleNameForBackend = async (hospitalId,roleName) => {
    try {
        const staffMembers = await Staff.find({ hospitalId, jobRole: roleName });
        if (!staffMembers.length) {
            return res.status(404).json({ message: "No staff members found" });
        }
        res.status(200).json(staffMembers);
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: "Server error", error: e.message }); // ✅ Handle errors properly
    }
};






exports.getStaff = getStaff
exports.createStaff = createStaff
exports.getId = getId
exports.getStaffById = getStaffById
exports.updateStaff = updateStaff
exports.updateStaffStatus = updateStaffStatus
exports.addStaffFromExcel = addStaffFromExcel
exports.getStaffByHplId = getStaffByHplId
exports.checkEmail = checkEmail
exports.getStaffChartData = getStaffChartData
exports.getStaffByRoleName = getStaffByRoleName
exports.getStaffByRoleNameForBackend = getStaffByRoleNameForBackend
