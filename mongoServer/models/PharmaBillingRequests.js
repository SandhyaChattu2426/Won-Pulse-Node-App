const mongoose = require('mongoose');

const BillRequestsByDoctorSchema = new mongoose.Schema({
    requestId: { type: String },
    patientName: { type: String, required: true },
    patientId: { type: String },
    appointmentId: { type: String }, // Reference to a Patient model
    medicineList: [{
        medicineId: { type: String }, // Reference to a medicine collection if needed
        name: { type: String },
        quantity: { type: Number },
        schedule: [{ type: String }]
    }],
    status: { type: String },
    hospitalId: { type: String },
    doctorId: { type: String }
}, {
    timestamps: { createdAt: true, updatedAt: true } // ✅ Correct placement
});

module.exports = mongoose.model('BillRequestsByDoctor', BillRequestsByDoctorSchema);
