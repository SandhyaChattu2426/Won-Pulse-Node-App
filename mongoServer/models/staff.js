const mongoose = require('mongoose')
const Schema = mongoose.Schema

const staffSchema = new Schema({
        staffId: { type: String, required: true },
        fullName: { type: String, required: true },
        dateOfBirth: { type: String },
        gender: { type: String, },
        email: { type: String, required: true },
        contactNumber: { type: String, required: true },
        street: { type: String, required: true },
        city: { type: String, required: true },
        state: { type: String, required: true },
        zipcode: { type: String, required: true },
        jobRole: { type: String, required: true },
        department: { type: String, required: true },
        employmentType: { type: String, required: true },
        qualification: { type: String, required: true },
        nightShift: { type: String, required: false },
        online: { type: String, required: false },
        status: { type: String, required: true },
        hospitalId: { type: String, },
        password: { type: String, },
        role: { type: String },
        doctorType: { type: String, required: false },
        is_mfa_enabled: { type: String, default: "false" },
        mfa_type: { type: [String], default: [] },
        passkey: { type: String },
        registeredOn: { type: Date, default: Date.now },
        DoctorAppointments: [{ type: String, required: false }]
}, { minimize: true })

module.exports = mongoose.model('Staff', staffSchema)