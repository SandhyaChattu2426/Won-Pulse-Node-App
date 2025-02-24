const mongoose = require('mongoose')
const Schema = mongoose.Schema

const staffSchema = new Schema({
        staffId: { type: String, required: true },
        fullName: { type: String, required: true },
        dateOfBirth: { type: String, required: true },
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
        nightShift:{type:String,required:false},
        online:{type:String,required:false},
        status: { type: String, required: true },
// add emergencyContactdetails As per the requirement


})

module.exports = mongoose.model('Staff', staffSchema)