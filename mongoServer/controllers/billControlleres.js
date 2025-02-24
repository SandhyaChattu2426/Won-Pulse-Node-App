const HttpError = require('../models/http-error')

const GeneralBill=require('../models/Bill')
//CREATE AN APPOINTMENT
const createBill = async (req, res, next) => {
    console.log("create  bill Triggered By Lords grace")
    const newBill = new GeneralBill ({
        ...req.body
    })
    // console.log(req.body)
    try {
        await newBill.save()
    }
    catch (e) {
        console.log(e)
        return new HttpError("Can not created", 501)
    }
    res.json({msg:"Bill Created SuccessFully"})

}

//GETTING ID 
const getId = async (req, res, next) => {
    console.log("triggering to getId")
    let newAppointmentId;
    const str = "0";

    try {
        const Bill = await GeneralBill.find({});
   

        if (Bill.length > 0) {
            // Get the last hospital document, sorted by _id in descending order
            const lastBill = await GeneralBill.find({}).sort({ _id: -1 }).limit(1);
            console.log(lastBill,"last Bill")
            // Extract the last hospital's hospitalId
            const lastBillId= lastBill[0].billId;
           
             const lastNumber = parseInt(lastBillId.substring(2));  // Extracts the number part after 'HP'
            console.log(lastNumber)
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
        res.json({ id: newBillId });

    } catch (err) {
        const error = new HttpError("Couldn't fetch the hospital details", 500);
        console.log(err)
        return next(error);
    }
};

const getBills = async (req, res, next) => {
    // console.log("getting Appointments please wait")
    let appointments
    try {
        appointments = await GeneralBill.find({})
        // console.log(appointments)
    }
    catch (e) {
        console.log(e)
    }
    res.json({ appointments })
}
const getBillByBillId=async(req,res,next)=>{
    const {Id}=req.params
     console.log(Id)
    let Bill;
    try {
        Bill = await GeneralBill.findOne({"billId": Id })
        console.log(Bill)
    }
    catch (e) {
        console.log(e)
    }
    res.json({ medicineBill:Bill })
}


const updateAppointments = async (req, res, next) => {
    const { Id } = req.params()
    console.log(Id)
    //Getting appointment

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


const updateAppointmentStatus=async (req,res,next)=>{

    try{
    console.log("Updation Staff status")
    const ApId=req.params.Id
    // console.log(StaffId,"here is")
   const appointment = await Appointments.findOne({appointmentId:ApId})
   
    if(appointment){
        try{
        appointment.status=req.body.status
        await appointment.save()
        return res.status(200).json({ message: "Appointment status updated successfully!" });
        
        }catch(e){
            console.log(e)
            console.log("Could not find the patient")
        }
    }
    }
    catch(e){
        console.log(e)
    }
}

const getBillByPatientId=async(req,res,next)=>{
    const {Id}=req.params
     console.log(Id)
     console.log("Triggering Bill In the Backend")
     console.log("prabhuva please")
    let Appointment
    try {
        Appointment = await PharmaBill.findOne({"patientId": Id })
        console.log("triggering try block")
        console.log(Appointment)
      
    }
    catch (e) {
        console.log(e)
        // console.log("triggering catch-block")
    }
    res.json({ medicineBill:Appointment })
}


exports.createBill = createBill
exports.getBills = getBills
exports.getId = getId
// exports.updateAppointments = updateAppointments
// exports.updateAppointmentStatus=updateAppointmentStatus
// exports.getBillByPatientId=getBillByPatientId
exports.getBillByBillId=getBillByBillId