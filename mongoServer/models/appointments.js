const mongoose = require('mongoose')
const patient = require('./patient')
const Schema = mongoose.Schema

const AppointmentsSchema = new Schema({
    appointmentId: { type: String, required: true },
    appointmentDate: { type: String, required: true },
    appointmentTime: { type: String, required: true },
    appointmentType:{ type: String, required: true },
    doctorName: { type: String, required: true },
    patientId: { type: String, required: true },
    patientName: { type: String, required: true },
    paymentType: { type: String, required: true },
    status: { type: String, required: true },
    hospitalId:{ type: String},
    month:{type:String},
    doctorId:{type:String},
    isPatientAccepted:{type:Boolean,default:false},
    isDoctorAccepted:{type:Boolean,default:false},
    rescheduledTime:{type:String},
    originalAppointmentTime:{type:String},
    newMedicineList:[{
        medicineId:{type:String},
        name:{type:String},
        dosage:{type:String},
        quantity:{type:String},
        schedule:[{typr:String}]
    }],
    paymentStatus:{type:String},
    rescheduleCount:{type:Number}
})

module.exports = mongoose.model('appointments', AppointmentsSchema)