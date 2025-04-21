const mongoose = require('mongoose')
const Schema = mongoose.Schema

const AdmissionSchema = new Schema({
    admissionId: { type: String, required: true },
    patientName: { type: String, required: true },
    reasonForAdmission: { type: String, required: true },
    admissionType: { type: String, required: true },
    patientId: { type: String },
    roomNumber: { type: Number },
    roomType: { type: String },
    roomCharge: { type: String },
    roomId: { type: String },
    bloodPressure: { type: String },
    heartRate: { type: String },
    respiratoryRate: { type: String },
    temperature: { type: String },
    oxygenLevel: { type: String },
    listItem: [{
        id: { type: String },
        name: { type: String },
        quantity: { type: String },
        addedBy: { type: String },
        dateAdded: { type: String} ,
        _id: { type: String}
    }],
    admissionDate: { type: Date, required: true }, 
    status: { type: String },
    medicineList: [{
        medicineName: { type: String },
        quantity: { type: Number },
        addedBy: { type: String },
        dateAdded: { type: Date, default: Date.now } 
    }],
    hospitalId: { type: String },
    staffId: { type: String },
    createdAt: {
        type: Date,
        default: Date.now 
    },
    paymentStatus:{type:String,default:"pending"}
})

module.exports = mongoose.model('Admissions', AdmissionSchema)
