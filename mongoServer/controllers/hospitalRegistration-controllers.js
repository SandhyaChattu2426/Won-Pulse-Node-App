const { response } = require('express')
const HttpError = require('../models/http-error')
//const suppliers = require('../models/suppliers')
const Hospitals = require('../models/hospitals')

//Register Supplier

const AddHospital = async (req, res, next) => {
    // const { supplierDetails, adress } = req.body
    // console.log("Hospital Block")

    const newsupplier = new Hospitals({
        ...req.body,
    })

    try {
        // console.log(req.body)

        await newsupplier.save()
        console.log("Hospital Registered SuccessFully")
        res.json({ message: "Hospital registered successfully" });
    }
    catch (e) {
        console.log(e)
        console.log("Catch-block")
    }

}

const GetHospitals = async (req, res, next) => {
    console.log("triggeing GET Hospitals")
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
    // console.log(Id)
    // console.log("Triggering")
    let hospital
    try {
        // const url=`http://locolhost:5000/api/appointments/${Id}`
        hospital = await Hospitals.findOne({ hospitalId: Id })
        console.log(hospital)
        // console.log("triggering try-block")
    }
    catch (e) {
        console.log(e)
        // console.log("triggering catch-block")
    }
    res.json({ hospital })
}

//UPDATE HOSPITAL
const updateHospital = async (req, res, next) => {
    console.log("triggering update block")
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

exports.AddHospital = AddHospital
exports.GetHospitals = GetHospitals
exports.getId = getId
exports.getHospitalById = getHospitalById
exports.updateHospital = updateHospital
exports.updatePassword = updatePassword