const HttpError = require('../models/http-error')

const Appointments = require('../models/appointments')
const Patinets=require('../models/patient')

//CREATE AN APPOINTMENT
const createAppointment = async (req, res, next) => {
    const newAppointment = new Appointments({
        ...req.body
    })
    try {
        await newAppointment.save()
    }
    catch (e) {
        console.log(e)
        return new HttpError("Can not created", 501)
    }

}

//GETTING ID 
const getId = async (req, res, next) => {
    let newAppointmentId;
    let AppointmentsLength;
    const str = "0";
    try {
        // Fetch all hospitals from the database
        const appointments = await Appointments.find({});

        if (appointments.length > 0) {
            // Get the last hospital document, sorted by _id in descending order
            const lastAppointment = await Appointments.find({}).sort({ _id: -1 }).limit(1);
            // console.log(lastAppointment)
            // Extract the last hospital's hospitalId
            const lastAppointmentId = lastAppointment[0].appointmentId;
            // console.log(lastAppointmentId)

            // Calculate the next hospitalId based on the last one
            // Extract the numeric part of the last hospitalId (assuming the format is HP000001)
            const lastNumber = parseInt(lastAppointmentId.substring(2));  // Extracts the number part after 'HP'
            console.log(lastNumber)
            // Generate the next hospitalId (increment the last number)
            const nextNumber = lastNumber + 1;

            // Determine the number of leading zeros required for the new ID
            const zerosCount = 6 - nextNumber.toString().length;
            newAppointmentId = 'AP' + str.repeat(zerosCount) + nextNumber.toString();

        }
        else {
            // If no hospitals exist, create the first hospitalId
            newAppointmentId = 'AP' + '0'.repeat(5) + "1";
            //    res.json({ id: newAppointmentId });// HP000001
        }

        // console.log("GeneratedAppointemnt ID:", newHospitalId);
        console.log(newAppointmentId)
        res.json({ id: newAppointmentId });

    } catch (err) {
        const error = new HttpError("Couldn't fetch the hospital details", 500);
        console.log(err)
        return next(error);
    }
};

// GETTING ALL THE APPOINTMENTS
const getAppointments = async (req, res, next) => {
const {hospitalId}=req.params;
    let appointments
    try {
        appointments = await Appointments.find({hospitalId:hospitalId})
    }
    catch (e) {
        console.log(e)
    }
    res.json({ appointments })
}

// PATCH THE APPOINTMENT
const updateAppointments = async (req, res, next) => {
    const { Id } = req.params()
    console.log(Id)
    try {
        const Appointment = await Appointments.findOne({
            appointmentId: Id
        })
        console.log(Appointment)

    }
    catch (e) {
        console.log(e)
    }

}
// Get Appointment By Id
const getAppointmentById = async (req, res, next) => {
    const { Id,hospitalId } = req.params
    console.log(req.params, "params")
    console.log("Triggering to fetch by id")
    let Appointment
    try {
        Appointment = await Appointments.findOne({ appointmentId: Id,hospitalId })
    }
    catch (e) {
        console.log(e)
    }
    res.json({ Appointment })
}

const updateAppointmentStatus = async (req, res, next) => {
    try {
        const ApId = req.params.Id
      
        const appointment = await Appointments.findOne({ appointmentId: ApId })

        if (appointment) {
            try {
                appointment.status = req.body.status
                if(req.body.status==="accepted"){
                    appointment.paymentStatus="pending"
                }
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

const getAppointmentByPatientId = async (req, res, next) => {
    const { Id } = req.params
    let Appointment;
    try {
        Appointment = await Appointments.findOne({ "patientId": Id,"status":"pending" })
    }
    catch (e) {
        console.log(e)
    }
    res.json({ Appointment })
}

const addAppointmentFromExcel = async (req, res, next) => {
    console.log("Triggering here")
    let last, lastId, newId;
    let createdItem;
    
    try {
        const totalItems = await Appointments.countDocuments();
        if (totalItems > 0) {
            last = await Appointments.findOne().sort({ _id: -1 });
            lastId = parseInt(last.appointmentId.slice(2));
            console.log(lastId, "lastid")
        } else {
            lastId = 0;
        }
        const prefix = "AP";
        const newNumber = lastId + 1;
        const paddedNumber = newNumber.toString().padStart(6, "0");
        newId = prefix + paddedNumber;
        console.log(newId)
    } catch (err) {
        return next(new HttpError(`Creating report ID failed, Please try again. ${err}`, 500));
    }

    console.log(req.body, "request")
    // Create a new inventory item
    let appointmentDate = req.body.appointmentdate;

    if (!isNaN(appointmentDate)) { 
        let excelDate = new Date((appointmentDate - 25569) * 86400000); 
        appointmentDate = excelDate.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }); 
        // Output will be in "14 FEB 2024" format
    }
    createdItem = new Appointments({
        appointmentId:newId,
        appointmentDate: appointmentDate,
        appointmentTime: req.body.appointmenttime,
        doctorName: req.body.doctorname,
        patientId: req.body.patientid,
        patientName: req.body.patientname,
        paymentType: req.body.paymenttype,
        month:req.body.month,
        status: req.body.status
    });

    if (!req.body.appointmentdate || !req.body.appointmenttime || !req.body.doctorname || !req.body.patientname || !req.body.status) {
        return res.status(400).send({ message: "Incomplete Appointment details." });
    }

    else {
        try {
            await createdItem.save()
            res.status(201).json({ item: createdItem });
        } catch (err) {
            return next(new HttpError(`Creating item failed, Please try again. ${err}`, 500));
        }
    }
}

const updateStatus = async (req, res, next) => {

    try {
        const appointment = await Appointments.findOne({
            appointmentId: req.params.id,
            hospitalId: req.params.hospitalId
        });

        if (!appointment) {
            return res.status(404).json({ message: "Appointment not found" });
        }

        // Dynamically update fields based on request body
        Object.keys(req.body).forEach(key => {
            appointment[key] = req.body[key];
        });

        await appointment.save();

        res.status(200).json({ message: "Status Updated Successfully" });

    } catch (e) {
        console.log(e);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

const  getAppointmentsByDoctorIdAndDate=async (req, res, next) => {
    const { doctorId, date,hospitalId } = req.params;
    let appointments
    let list
    try {
        appointments = await Appointments.find({ doctorId: doctorId, appointmentDate: date,hospitalId:hospitalId })
        
    }
    catch (e) {
        console.log(e)
    }
    console.log(list,"list")
    res.json({ appointments:appointments })
}



exports.createAppointment = createAppointment
exports.getAppointments = getAppointments
exports.getId = getId
exports.updateAppointments = updateAppointments
exports.getAppointmentById = getAppointmentById
exports.updateAppointmentStatus = updateAppointmentStatus
exports.getAppointmentByPatientId = getAppointmentByPatientId
exports.addAppointmentFromExcel = addAppointmentFromExcel
exports.updateStatus=updateStatus
exports.getAppointmentsByDoctorIdAndDate=getAppointmentsByDoctorIdAndDate
