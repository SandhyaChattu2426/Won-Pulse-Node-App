const HttpError = require('../models/http-error')

const PharmaBill = require('../models/pharmacyBilling')
//CREATE AN APPOINTMENT
const createBill = async (req, res, next) => {
    try {
        let billId = req.body.billId;

        if (!billId) {
            const billCount = await PharmaBill.countDocuments();
            const numericId = billCount + 1;
            billId = 'PB' + String(numericId).padStart(6, '0');
        }

        const newBill = new PharmaBill({
            ...req.body,
            billId: billId
        });

        await newBill.save();
        res.json({ msg: "Bill Created Successfully", billId });
    } catch (e) {
        console.log(e);
        return next(new HttpError("Cannot create bill", 501));
    }
};



//GETTING ID 
const getId = async (req, res, next) => {
    const str = "0";
    const { hospitalId } = req.params
    try {
        const Bill = await PharmaBill.find({ hospitalId: hospitalId });


        if (Bill.length > 0) {
            // Get the last hospital document, sorted by _id in descending order
            const lastBill = await PharmaBill.find({ hospitalId }).sort({ _id: -1 }).limit(1);
            const lastBillId = lastBill[0].billId;
            const lastNumber = parseInt(lastBillId.substring(2));  // Extracts the number part after 'HP'
            // // Generate the next hospitalId (increment the last number)
            const nextNumber = lastNumber + 1;

            // // Determine the number of leading zeros required for the new ID
            const zerosCount = 6 - nextNumber.toString().length;
            newBillId = 'PB' + str.repeat(zerosCount) + nextNumber.toString();

        }
        else {
            newBillId = 'PB' + '0'.repeat(5) + "1";

        }

        // console.log("GeneratedAppointemnt ID:", newHospitalId);
        res.json({ id: newBillId });

    } catch (err) {
        const error = new HttpError("Couldn't fetch the hospital details", 500);
        return next(error);
    }
};

const getBills = async (req, res, next) => {
    const { hospitalId } = req.params
    let appointments
    try {
        appointments = await PharmaBill.find({ hospitalId: hospitalId })
    }
    catch (e) {
        console.log(e)
    }
    res.json({ appointments })
}
const getBillByBillId = async (req, res, next) => {
    const { Id } = req.params
    let Bill;
    try {
        Bill = await PharmaBill.findOne({ "billId": Id })
    }
    catch (e) {
        console.log(e)
    }
    res.json({ medicineBill: Bill })
}


const updateAppointments = async (req, res, next) => {
    const { Id } = req.params()
    try {
        const Appointment = await Appointments.findOne({
            appointmentId: Id
        })
    }
    catch (e) {
        console.log(e)
    }

}


const updateAppointmentStatus = async (req, res, next) => {
    try {
        const ApId = req.params.Id
        const appointment = await Appointments.findOne({ appointmentId: ApId })
        if (appointment) {
            try {
                appointment.status = req.body.status
                await appointment.save()
                return res.status(200).json({ message: "Appointment status updated successfully!" });

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

const getBillByPatientId = async (req, res, next) => {
    const { Id } = req.params
    console.log(Id)
    let Appointment
    try {
        Appointment = await PharmaBill.findOne({ "patientId": Id })
        console.log("triggering try block")
        // console.log(Appointment)
    }
    catch (e) {
        console.log(e)
    }
    res.json({ medicineBill: Appointment })
}


exports.createBill = createBill
exports.getBills = getBills
exports.getId = getId
exports.updateAppointments = updateAppointments
exports.updateAppointmentStatus = updateAppointmentStatus
exports.getBillByPatientId = getBillByPatientId
exports.getBillByBillId = getBillByBillId