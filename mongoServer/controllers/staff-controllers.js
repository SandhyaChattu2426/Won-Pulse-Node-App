const HttpError = require('../models/http-error')

const { v4: uuid } = require("uuid")
const { validationResult } = require('express-validator')

const Staff = require('../models/staff')
const { request } = require('express')

// CreateStaff
const createStaff = async (req, res, next) => {
    console.log("creating staff by lords grace")
    const newStaff = new Staff({
        ...req.body
    })
    try {
        await newStaff.save()
        console.log("triggering staff creation by lords grace")
    } catch (e) {
        console.log(e)
        return new HttpError("Can not created", 501)
    }
    res.send("Staff created by lords grace")

}

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
    let newStaffId;
    let ZerosCount;
    let staffLength;
    const str = "0";  // String to repeat for padding
    console.log("BackendTriggering to get Staff Id");

    try {
        // Fetch all staff records from the database
        const staff = await Staff.find({});

        console.log("Current number of staff records:", staff.length);

        // Calculate the number of staff records and how many leading zeros are needed
        staffLength = staff.length;
        ZerosCount = 6 - (staffLength.toString()).length;  // Ensure 6 digits for the ID

        console.log("Zeros needed:", ZerosCount);

        // Generate the new staff ID with leading zeros and a prefix of 'ST'
        if (staff.length > 0) {
            newStaffId = 'ST' + str.repeat(ZerosCount) + (staffLength + 1).toString();
        } else {
            // If no staff records exist, generate the first staff ID as 'ST000001'
            newStaffId = 'ST' + '0'.repeat(5) + "1";
        }

        console.log("New Staff ID generated:", newStaffId);

        // Send the generated ID in the response
        res.json({ id: newStaffId });
    } catch (err) {
        const error = new HttpError("Couldn't Fetch the Staff Details", 500);
        return next(error);
    }

    // Now create a new staff object and save it to the database
    const newStaff = new Staff({
        personalInformation: {
            fullName: "John Doe",  // Replace with actual data
            dateOfBirth: "1985-12-15",
            gender: "Male",
            email: "john.doe@example.com",
            contactNumber: "+1234567890"
        },
        address: {
            street: "123 Main St",
            city: "New York",
            state: "NY",
            zipCode: "10001"
        },
        typeOfStaff: {
            jobRole: "Nurse",  // Replace with actual job role
            department: "Emergency",  // Replace with actual department
            employmentType: "Full-time"  // Replace with actual employment type
        },
        qualification: "Bachelor's in Nursing"  // Replace with actual qualification
    });

    try {
        // Save the new staff object to the database
        await newStaff.save();
        console.log("New staff saved successfully");
    } catch (e) {
        console.log("Error saving staff:", e);
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

// const addStaffFromExcel = async (req, res, next) => {
//     console.log("Triggering here")


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
//     const existingStaff = await Staff.findOne({ email: req.body.email });  // You can use email or staffId for uniqueness
//     if (existingStaff) {
//         return res.status(400).json({ message: "Staff member with this email already exists." });
//     }


//     createdItem = new Staff({
//         staffId: newId,
//         fullName: req.body.fullname,
//         dateOfBirth: req.body.dateofbirth,
//         gender: req.body.gender,
//         email: req.body.email,
//         contactNumber: req.body.contactnumber,
//         street: req.body.street,
//         city: req.body.city,
//         state: req.body.state,
//         zipcode: req.body.zipcode,
//         jobRole: req.body.jobrole,
//         department: req.body.department,
//         employmentType: req.body.employmenttype,
//         qualification: req.body.qualification,
//         nightShift: req.body.nightshift,
//         online: req.body.online,
//         status: req.body.status || "Active",
//     });
//     if (!req.body.fullname || !req.body.dateofbirth || !req.body.gender || !req.body.jobrole || !req.body.department || !req.body.qualification || !req.body.status) {
//         return res.status(400).send({ message: "Incomplete report details." });
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





exports.getStaff = getStaff
exports.createStaff = createStaff
exports.getId = getId
exports.getStaffById = getStaffById
exports.updateStaff = updateStaff
exports.updateStaffStatus = updateStaffStatus
exports.addStaffFromExcel = addStaffFromExcel
