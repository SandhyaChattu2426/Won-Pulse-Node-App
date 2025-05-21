const Hospital = require("../models/hospitals");
const Patient = require("../models/patient");
const nodemailer = require("nodemailer");


// EMAIL TRANSPORTER SETUP
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

const getHospitalAndPatientDetails = async(hospitalId, patientID) => {
  if (!hospitalId || !patientID) {
    throw new Error("Hospital ID and Patient ID are required.");
  }

  try {
    const hospital = await Hospital.findOne({ hospitalId: hospitalId });
    const patient = await Patient.findOne({ patientId: patientID ,hospitalId: hospitalId});
    

    if (!hospital) {
      throw new Error("Hospital not found.");
    }

    if (!patient) {
      throw new Error("Patient not found.");
    }

    console.log()
    return { ...hospital.toObject(), ...patient.toObject() };
  } catch (err) {
    console.error("Error fetching hospital and patient details:", err);
    throw new Error("Error fetching hospital and patient details.");
  }
};


const sendPaymentEmail = async (deatils, link, amount) => {
    try {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: 'sandhyachattu@gmail.com',
            subject: 'testing payment for won PULSE',
            text: `whats uppppppp ${link}`,
        };

        // Send email
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent:', info.response);
        return true;
    } catch (error) {
        console.error('Error sending email:', error);
        return false;
    }
};


module.exports = {
  getHospitalAndPatientDetails,
  sendPaymentEmail
};
