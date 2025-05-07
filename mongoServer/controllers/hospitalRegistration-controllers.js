const { response } = require('express')
const HttpError = require('../models/http-error')
//const suppliers = require('../models/suppliers')
const Hospitals = require('../models/hospitals')
const path = require("path");
const fs = require("fs");
const nodemailer = require('nodemailer');
const mongoose = require("mongoose");
const { CreateRazorpayLinkedAccount } = require('../payment-gateway/razorpay-helper-functions')




const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

// Invitation email function
const sendConfirmation = async (hospital) => {
    const { hospitalDetails, AdministrativeDetails, contactInformation } = hospital
    const emailTemplatePath = path.join(
        __dirname,
        "..",
        "EmailTemplates",
        "AdminWelcomeAfterReg.html"
    );
    let emailTemplate = fs.readFileSync(emailTemplatePath, "utf-8");
    const url = `${process.env.ALLOWEDURLS}/hospital/${hospital.hospitalId}`
    emailTemplate = emailTemplate
        .replace(/{{hospital_name}}/g, hospitalDetails.hospitalName || "WON PULSE")
        .replace(/{{owner_name}}/g, AdministrativeDetails.adminstrativeName || "WON PULSE")
        .replace(/{{our_email}}/g, "nowitservices@gmail.com")
        .replace(/{{contact}}/g, "987456321")
        .replace(/{{navigation_url}}/g, url);
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: contactInformation.email,
        subject: "WONPULSE:  You're Almost In! Complete Your Won Pulse Registration",
        html: emailTemplate,
    };
    return transporter.sendMail(mailOptions);
};

const AddHospital = async (req, res, next) => {
    const session = await mongoose.startSession();
    session.startTransaction(); 

    try {
        const newHospital = new Hospitals({ ...req.body, category: 'healthcare', sub_category: 'hospital', });

        // Check for existing hospital by email
        const existingHospital = await Hospitals.findOne({
            "contactInformation.email": newHospital?.contactInformation?.email
        }).session(session);

        if (existingHospital) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({ success: false, message: "Hospital with this email already exists" });
        }

        // Save the new hospital
        const savedHospital = await newHospital.save({ session });
        const hospitalId = savedHospital?.hospitalId;

        const hospitalDetails = {
            business_type: newHospital?.business_type,
            hospital_name: newHospital?.hospitalDetails?.hospitalName,
            category: 'healthcare',
            sub_category: 'hospital',
            street: newHospital?.address?.street,
            city: newHospital?.address?.city,
            state: newHospital?.address?.state, 
            postcode: newHospital?.address?.zipcode,
            country: 'india',
        };

        console.log("Hospital details for Razorpay:", hospitalDetails); // Log for debugging

        await CreateRazorpayLinkedAccount(
            hospitalId,
            newHospital?.contactInformation?.email,
            newHospital?.AdministrativeDetails?.administrativeName,
            newHospital?.AdministrativeDetails?.administrativeContact,
            hospitalDetails,
            session
        );

        await sendConfirmation(savedHospital);

        await session.commitTransaction();
        session.endSession();

        return res.status(200).json({ success: true, message: "Hospital registered successfully" });

    } catch (e) {
        await session.abortTransaction();
        session.endSession();
        console.error("Error saving hospital:", e);
        return res.status(500).json({ success: false, message: "Failed to register hospital" });
    }
};


const GetHospitals = async (req, res, next) => {
    let List;
    try {
        List = await Hospitals.find({})
        // console.log(List)
    }
    catch (e) {
        console.log(e)
    }
    res.json({ List })
}

const getId = async (req, res, next) => {
    let newHospitalId;
    let HospitalsLength;
    const str = "0";
    console.log("Backend triggering to get ID");
    try {
        // Fetch all hospitals from the database
        const admissions = await Hospitals.find({});

        if (admissions.length > 0) {
            // Get the last hospital document, sorted by _id in descending order
            const lastHospital = await Hospitals.find({}).sort({ _id: -1 }).limit(1);

            // Extract the last hospital's hospitalId
            const lastHospitalId = lastHospital[0].hospitalId;

            // Calculate the next hospitalId based on the last one
            // Extract the numeric part of the last hospitalId (assuming the format is HP000001)
            const lastNumber = parseInt(lastHospitalId.substring(2));  // Extracts the number part after 'HP'

            // Generate the next hospitalId (increment the last number)
            const nextNumber = lastNumber + 1;

            // Determine the number of leading zeros required for the new ID
            const zerosCount = 6 - nextNumber.toString().length;
            newHospitalId = 'HP' + str.repeat(zerosCount) + nextNumber.toString();
        } else {
            // If no hospitals exist, create the first hospitalId
            newHospitalId = 'HP' + '0'.repeat(5) + "1";  // HP000001
        }

        console.log("Generated Hospital ID:", newHospitalId);
        res.json({ id: newHospitalId });

    } catch (err) {
        const error = new HttpError("Couldn't fetch the hospital details", 500);
        return next(error);
    }
};

//Get Hospital By Id
const getHospitalById = async (req, res, next) => {
    const { Id } = req.params
    let hospital
    try {
        hospital = await Hospitals.findOne({ hospitalId: Id })
    }
    catch (e) {
        console.log(e)
    }
    res.json({ hospital })
}

//UPDATE HOSPITAL
const updateHospital = async (req, res, next) => {
    const {
        hospitalId,
        hospitalDetails,
        contactInformation,
        accederationDetails,
        facilities,
        AdministrativeDetails
    } = req.body;

    const { Id } = req.params
    // console.log(req.body)

    let hospital;
    try {
        hospital = await Hospitals.findOne({ hospitalId: Id })
        console.log(hospital)
    }
    catch (err) {
        const error = new HttpError("Can not find a place by provided place id", 500)
        console.log({ err })

        return next(error)
    }
    try {
        hospital.hospitalId = hospitalId,
            hospital.hospitalDetails = hospitalDetails,
            hospital.contactInformation = contactInformation,
            hospital.accederationDetails = accederationDetails,
            hospital.facilities = facilities,
            hospital.AdministrativeDetails = AdministrativeDetails
        hospital.save()
    }
    catch (err) {
        const error = new HttpError("couldnt Updated", 500)
        console.log("catch-block")
        return next(error)

    }

    res.status(200).json("Hospital updated Successfully")
}

const updatePassword = async (req, res, next) => {
    const { password, role } = req.body
    const { Id } = req.params
    const hashPassword = async (plainTextPassword) => {
        const saltRounds = 10;
        try {
            const hashedPassword = await bcrypt.hash(plainTextPassword, saltRounds);
            return hashedPassword;
        } catch (err) {
            throw new Error('Error hashing password');
        }
    };
    const hospital = await Hospitals.findOne({ hospitalId: Id })

    if (hospital) {
        hospital.password = await hashPassword(password);
        hospital.role = role
        const data = await hospital.save()
        res.json({ role: data.role, message: "password Updated Successfully" })
    }
    else {
        res.json({ message: "Hospital is not found" })
    }
}

const getHospitalByEmail = async (req, res, next) => {
    const { email } = req.params
    console.log(email, "email")
    let hospital
    try {
        hospital = await Hospitals.findOne({ "contactInformation.email": email })
        console.log(hospital)
    }
    catch (e) {
        console.log(e)
    }
    res.json({ hospital })
}

const getHospitalReturnName = async (req, res, next) => {
    const { hospitalId } = req.params
    let hospital
    try {
        hospital = await Hospitals.findOne({ hospitalId: hospitalId })
    }
    catch (e) {
        console.log(e)
    }
    res.json({ hospitalName: hospital.hospitalDetails.hospitalName })
}

const AddAnnouncements = async (req, res, next) => {
    try {
        const { hospitalId } = req.params
        const { text } = req.body
        let hospital = await Hospitals.findOne({ hospitalId: hospitalId })
        if (hospital) {
            hospital.alerts = text
            await hospital.save()
            res.json({ message: "Announcement added successfully", success: true })
        } else {
            res.status(404).json({ message: "Hospital not found", success: false })
        }
    } catch (e) {
        console.log(e)
    }
}

const GetAlert = async (req, res, next) => {
    const { hospitalId } = req.params;

    try {
        const hospital = await Hospitals.findOne({ hospitalId });

        if (!hospital) {
            return res.status(404).json({ success: false, message: "Hospital not found." });
        }

        return res.status(200).json({
            success: true,
            data: {
                text: hospital.alerts || "", // if null, send empty string
            },
        });
    } catch (error) {
        console.error("Error fetching alert:", error);
        return res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
};

exports.AddHospital = AddHospital
exports.GetHospitals = GetHospitals
exports.getId = getId
exports.getHospitalById = getHospitalById
exports.updateHospital = updateHospital
exports.updatePassword = updatePassword
exports.getHospitalByEmail = getHospitalByEmail
exports.getHospitalReturnName = getHospitalReturnName
exports.AddAnnouncements = AddAnnouncements
exports.GetAlert = GetAlert