const mongoose = require('mongoose')
const patient = require('./patient')
const Schema = mongoose.Schema

const AppointmentsSchema = new Schema({
    appointmentId: { type: String, required: true },
    appointmentDate: { type: String, required: true },
    appointmentTime: { type: String, required: true },
    doctorName: { type: String, required: true },
    patientId: { type: String, required: true },
    patientName: { type: String, required: true },
    paymentType: { type: String, required: true },
    status: { type: String, required: true },
    hospitalId:{ type: String},
    month:{type:String}
})

module.exports = mongoose.model('appointments', AppointmentsSchema)