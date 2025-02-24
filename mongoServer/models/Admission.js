const mongoose = require('mongoose')
const Schema = mongoose.Schema

const AdmissionSchema = new Schema({
    admissionId: { type: String, required: true },
    patientName: { type: String, required: true },
    reasonForAdmission: { type: String, required: true },
    admissionType: { type: String, required: true },
    patientId: { type: String },
    roomNumber: { type: Number, required: true },
    roomType: { type: String, required: true },
    roomCharge: { type: String },
    roomId: { type: String },
    bloodPressure: { type: String, required: true },
    heartRate: { type: String, required: true },
    respiratoryRate: { type: String, required: true },
    temparature: { type: String,  },
    oxygenLevel: { type: String, },
    listItem: [{
        id: { type: String, },
        name: { type: String, },
        quantity: { type: String, },
        addedBy: { type: String, },
        dateAdded: { type: String, }
    }],
    admissionDate: { type: String },
    patientId: { type: String },
    status: { type: String },

    medicineList: [{
        medicineName: { type: String },
        quantity:{ type: Number },
        AddedBy: { type: String },
        dateAdded:{type:String}
    }]
})

module.exports = mongoose.model('Admissions', AdmissionSchema)