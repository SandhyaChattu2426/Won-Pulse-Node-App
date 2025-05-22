const HttpError = require('../models/http-error');
const { createOrderPaymentLinkById } = require('../payment-gateway/razorpay-helper-functions');
const Appointments = require('../models/appointments');
const Reports = require('../models/reports')
const Admission=require('../models/Admission')
const PatientFunction = require('./patients-controllers')
const path = require("path");
const fs = require("fs");

const GeneralBill = require('../models/Bill');
const reports = require('../models/reports');
const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

const sendEmail = async (billId, patientId, hospitalId) => {
    console.log("Sending email to hospital");
    const emailTemplatePath = path.join(
        __dirname,
        "..",
        "EmailTemplates",
        "PaymentSuccessFull.html",

    );
    let emailTemplate = fs.readFileSync(emailTemplatePath, "utf-8");
    const hospital = await PatientFunction.GetHospitalDetails(hospitalId)
    const patient = await PatientFunction.returnEmail(patientId, hospitalId)
    emailTemplate = emailTemplate
        .replace(/{{hospital_name}}/g, hospital.hospitalName || "WON PULSE")
        .replace(/{{bill_id}}/g, billId || "WON PULSE")

        .replace(/{{patient_name}}/g, patient?.name || "WON PULSE")
        .replace(/{{patient_email}}/g, patient?.email || "WON PULSE")
        .replace(/{{mobile}}/g, hospital.mobile)
        .replace(/{{email}}/g, hospital.email)
        .replace(/{{adress}}/g, hospital.address)
        // .replace(/{{reason}}/g, reason || "Headche");
    ;
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: patient.email||"sandhya.chattu@nowitservices.com",
        subject: "WONPULSE:You Have a New Appointment Request from a Patient",
        html: emailTemplate,
    };
    return transporter.sendMail(mailOptions);

}



//CREATE AN APPOINTMENT
const createBill = async (req, res, next) => {
    const newBill = new GeneralBill({
        ...req.body
    })
    console.log(req.body, 'this is body')
    try {
        if (req.body.paymentType === "Online") {
            const x = await createOrderPaymentLinkById({ ...req.body, billType: "GeneralBill" });
            console.log("Payment Link Created", x)
        }
        await newBill.save();

        return res.status(201).json({ success: true, message: "Bill Created Successfully!" });
    }
    catch (e) {
        console.log(e, "error Here,,,,,")
        return res.status(500).json({ success: false, message: "Bill Creation Failed!" });
    }

}

//GETTING ID 
const getId = async (req, res, next) => {
    const str = "0";
    const { hospitalId } = req.params

    try {
        const Bill = await GeneralBill.find({ hospitalId: hospitalId });


        if (Bill.length > 0) {
            // Get the last hospital document, sorted by _id in descending order
            const lastBill = await GeneralBill.find({ hospitalId }).sort({ _id: -1 }).limit(1);
            // Extract the last hospital's hospitalId
            const lastBillId = lastBill[0].billId;

            const lastNumber = parseInt(lastBillId.substring(2));  // Extracts the number part after 'HP'
            // // Generate the next hospitalId (increment the last number)
            const nextNumber = lastNumber + 1;

            // // Determine the number of leading zeros required for the new ID
            const zerosCount = 6 - nextNumber.toString().length;
            newBillId = 'B' + str.repeat(zerosCount) + nextNumber.toString();

        }
        else {
            console.log("triggering else block")
            newBillId = 'B' + '0'.repeat(5) + "1";

        }
        // console.log("GeneratedAppointemnt ID:", newHospitalId);
        console.log(newBillId)
        return res.status(200).json({ success: true, message: "Bill ID Generated Successfully!", id: newBillId });

    } catch (err) {
        const error = new HttpError("Couldn't fetch the hospital details", 500);
        console.log(err)
        return res.status(500).json({ success: false, message: "Bill ID Generation Failed!" });
    }
};

const getBills = async (req, res, next) => {
    const { hospitalId } = req.params
    let Bills
    try {
        Bills = await GeneralBill.find({ hospitalId: hospitalId });
        return res.status(200).json({ success: true, message: "Bills fetched successfully!", Bills: Bills });
    }
    catch (e) {
        console.log(e);
        return res.status(500).json({ success: false, message: "Bills fetching failed!" });
    }
};


const getBillByBillId = async (req, res) => {
    const { Id, hospitalId } = req.params
    console.log(Id)
    let Bill;
    try {
        Bill = await GeneralBill.findOne({ billId: Id, hospitalId: hospitalId });
        console.log(Bill)
        return res.status(200).json({ success: true, message: "Bill fetched successfully!", medicineBill: Bill });
    }
    catch (e) {
        console.log(e);
        return res.status(500).json({ success: false, message: "Bill fetching failed!" });
    }
};


const updateAppointments = async (req, res, next) => {
    const { Id } = req.params()
    console.log(Id)
    try {
        const Appointment = await Appointments.findOne({
            appointmentId: Id
        })
        console.log(Appointment)
        return res.status(200).json({ success: true, message: "Appointment fetched successfully!", Appointment: Appointment });
    }
    catch (e) {
        console.log(e);
        return res.status(500).json({ success: false, message: "Appointment fetching failed!" });
    }

}

const updateAppointmentStatus = async (req, res, next) => {

    try {
        console.log("Updation Staff status")
        const ApId = req.params.Id
        // console.log(StaffId,"here is")
        const appointment = await Appointments.findOne({ appointmentId: ApId })

        if (appointment) {
            try {
                appointment.status = req.body.status
                await appointment.save()
                return res.status(200).json({ success: true, message: "Appointment status updated successfully!" });

            } catch (e) {
                console.log(e)
                console.log("Could not find the patient")
                return res.status(500).json({ success: false, message: "Appointment status update failed!" });
            }
        }
    }
    catch (e) {
        console.log(e);
        return res.status(500).json({ success: false, message: "Appointment status update failed!" });
    }
}

const getBillByPatientId = async (req, res, next) => {
    const { Id } = req.params
    console.log(Id)
    console.log("Triggering Bill In the Backend")
    console.log("prabhuva please")
    let Appointment
    try {
        Appointment = await PharmaBill.findOne({ "patientId": Id })
        console.log("triggering try block")
        console.log(Appointment)
        return res.status(200).json({ success: true, message: "Bill fetched successfully!", medicineBill: Appointment });
    }
    catch (e) {
        console.log(e)
        return res.status(500).json({ success: false, message: "Bill fetching failed!" });
    }
}

const updateBillStatus = async (id, hospitalId) => {
    const Bill = await GeneralBill.findOne({ billId: id, hospitalId: hospitalId });
    if (!Bill) {
        console.log("Bill not found");
        return;
    }

    console.log(Bill.billItems, "bill here....");

    try {
        for (const item of Bill.billItems) {
            if (item.itemId.includes("AP")) {
                console.log("triggering appointment");
                const appointment = await Appointments.findOne({ appointmentId: item.itemId, hospitalId: Bill.hospitalId });
                console.log(appointment, "appointment here");

                if (appointment) {
                    appointment.paymentStatus = "Success";
                    await appointment.save();
                    item.paymentStatus = "Paid";
                }
            }

            if (item.itemId.includes("MR")) {
                console.log("triggering report");
                const report = await reports.findOne({ "reportDetails.reportId": item.itemId, hospitalId: Bill.hospitalId });
                console.log(report, "report here");

                if (report) {
                    report.paymentStatus = "Success";
                    await report.save();
                    item.paymentStatus = "Paid";
                }
            }
            if(item.admissionId !== undefined){
                console.log("triggering admission");
                const admission = await Admission.findOne({ admissionId: item.admissionId, hospitalId: Bill.hospitalId });
                console.log(admission, "admission here");

               if(admission.listItem.length>0){
                admission.listItem.map((adItem) => {
                    if(adItem.id===item.id){
                        adItem.paymentStatus = "Paid";
                        item.paymentStatus = "Paid";
                        console.log("admission item payment status updated");
                    }
               });
            }
            admission.save();
        }
    }

        await Bill.save(); // Save the updated bill with modified billItems
        console.log("Bill status updated");
        sendEmail(Bill.billId, Bill.patientId, Bill.hospitalId);

    } catch (e) {
        console.error("Error updating bill status:", e);
    }
};




module.exports = {
    createBill,
    getBills,
    getId,
    // updateAppointments,
    // updateAppointmentStatus,
    // getBillByPatientId,
    getBillByBillId,
    updateBillStatus
}
