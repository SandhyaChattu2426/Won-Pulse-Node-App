const HttpError = require('../models/http-error')
const Admissions = require('../models/Admission')
const Admission = require('../models/Admission')
const Patients = require('../models/patient')
const Inventory = require('../Inventory/inventory-controllers')
const Pharmacy = require('../pharmacy/pharmacy-controllers')
const AddPatient = async (req, res, next) => {
    const newsupplier = new Admissions({
        ...req.body,
    })
    try {
        await newsupplier.save()
    }
    catch (e) {
        console.log(e)
    }
    res.json("Patient admitted Successfully")
}

const GetAdmissions = async (req, res, next) => {
    const { hospitalId } = req.params;

    let List;
    try {
        List = await Admissions.find({ hospitalId: hospitalId })
    }
    catch (e) {
        console.log(e)
    }
    res.json({ List })
}

// GET ID
const getId = async (req, res, next) => {
    const str = "0";
    try {
        const { hospitalId } = req.params
        const room = await Admissions.find({ hospitalId: hospitalId });

        if (room.length > 0) {
            const lastRoom = await Admissions.find({ hospitalId }).sort({ _id: -1 }).limit(1);
            const lastRoomId = lastRoom[0].admissionId;
            const lastNumber = parseInt(lastRoomId.substring(2));  // Extracts the number part after 'HP'
            const nextNumber = lastNumber + 1;
            const zerosCount = 6 - nextNumber.toString().length;
            newRoomId = 'AD' + str.repeat(zerosCount) + nextNumber.toString();
        } else {
            newRoomId = 'AD' + '0'.repeat(5) + "1";  // HP000001
        }

        res.json({ id: newRoomId });

    } catch (err) {
        console.log(err)

    }
};

const AdmissionDetailsById = async (req, res, next) => {
    const { Id, hospitalId } = req.params
    // console.log(Id)
    let Admission
    try {
        Admission = await Admissions.findOne({ admissionId: Id, hospitalId: hospitalId })
    }
    catch (e) {
        console.log(e)
    }
    res.json({ Admission })
}

const updateAddmissionStatus = async (req, res, next) => {
    console.log("Triggering HEre")
    try {
        const { id, hospitalId } = req.params
        const admission = await Admissions.findOne({ admissionId: id, hospitalId: hospitalId })
        console.log(admission, "admission")
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

    try {
        const AdmittedPerson = await Admissions.find({ "patientName": req.params.name.toLowerCase() });

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
        const jsonDate = new Date((serialDate - 25569) * 86400 * 1000);
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
    console.log(req.body, "req.body")

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

        const existingAdmission = await Admission.findOne({ patientId: existingPatient._id });

        // 🔹 Create admission 
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
            admissionDate: excelDateToJSDate(admissiondate), // is this returns exact date
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
    // console.log("Here");
    try {
        const { Id, hospitalId } = req.params;
        const updateData = req.body;

        const existingAdmission = await Admissions.findOne({ admissionId: Id, hospitalId: hospitalId });
        console.log(existingAdmission, "existingAdmission");

        if (!existingAdmission) {
            return res.status(404).json({ message: "Admission not found" });
        }

        // console.log(updateData.listItem, "updated listItem");
        // console.log(existingAdmission.listItem, "existingAdmission listItem");

        if (updateData.listItem && !Array.isArray(updateData.listItem)) {
            return res.status(400).json({ message: "listItem must be an array" });
        }

        const createItemMap = (list) => {
            const map = {};
            for (const item of list) {
                const itemId = item.itemId || item.id;
                if (itemId) {
                    map[itemId] = Number(item.quantity) || 0;
                }
            }
            return map;
        };

        if (Array.isArray(existingAdmission.listItem) && existingAdmission.listItem.length > 0) {
            const oldItemsMap = createItemMap(existingAdmission.listItem);
            const newItemsMap = createItemMap(updateData.listItem || []);

            // console.log(oldItemsMap, "oldItemsMap");
            // console.log(newItemsMap, "newItemsMap");

            const allItemIds = new Set([
                ...Object.keys(oldItemsMap),
                ...Object.keys(newItemsMap),
            ]);

            for (const itemId of allItemIds) {
                const oldQty = oldItemsMap[itemId] || 0;
                const newQty = newItemsMap[itemId] || 0;
                const netQtyChange = newQty - oldQty;

                if (netQtyChange === 0) continue;

                console.log(`ItemID: ${itemId}, OldQty: ${oldQty}, NewQty: ${newQty}, NetQtyChange: ${netQtyChange}`);

                if (itemId.startsWith("IN")) {
                    await Inventory.getInventoryByIdForBackend(itemId, netQtyChange, hospitalId);
                } else if (itemId.startsWith("PH")) {
                    await Pharmacy.getPharmacyForBackend(itemId, netQtyChange, hospitalId);
                }
            }
        }

        const updatedAdmission = await Admissions.findOneAndUpdate(
            existingAdmission._id,
            {
                $set: {
                    ...updateData,
                    updatedAt: new Date()
                }
            },
            {
                new: true,
                runValidators: true
            }
        );

        if (!updatedAdmission) {
            return res.status(500).json({ message: "Failed to update admission" });
        }

        res.status(200).json({
            message: "Admission updated successfully",
            data: updatedAdmission
        });

    } catch (error) {
        console.error("Error updating admission:", error);
        res.status(500).json({
            message: "Internal Server Error",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

const getIdByPatientId = async (req, res, next) => {
    const { patientId, hospitalId } = req.params;
    let Admission;

    try {
        Admission = await Admissions.findOne({ patientId: patientId, hospitalId: hospitalId, paymentStatus: "pending" });
        if (!Admission) {
            return res.status(404).json({ message: "No admission found for this patient" });
        }

        res.status(200).json({ admission: Admission });
    } catch (error) {
        console.error("Error fetching admission by patient ID:", error);
        res.status(500).json({
            message: "Internal Server Error",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

exports.getIdByPatientId = getIdByPatientId;

exports.AddPatient = AddPatient
exports.GetAdmissions = GetAdmissions
exports.getId = getId
exports.AdmissionDetailsById = AdmissionDetailsById
exports.updateAddmissionStatus = updateAddmissionStatus
exports.getRegisterdPatients = getRegisterdPatients
exports.AdmissionByPatientId = AdmissionByPatientId
exports.updateAdmission = updateAdmission
exports.addAdmissionFromExcel = addAdmissionFromExcel