const mongoose = require('mongoose')
const Schema = mongoose.Schema

const HospitalSchema = new Schema({
    hospitalId: { type: String, required: true },
    patientsAndStaffData: {
        employeeTotal: { type: String, required: true },
        patientsTotal: { type: String, required: true }
    },
    hospitalDetails: {
        hospitalName: { type: String, required: true },
        hospitalCode: { type: String, required: true },
        hospitalType: { type: String, required: true },
    },
    contactInformation: {
        phNo: { type: String,  },
        email: { type: String, required: true },
    },
    accederationDetails: {
        registrationNo: { type: String, required: true },
        hospitalCode: { type: String }
    },
    facilities: {
        availableWards: [{ type: String, required: true }],
        speciality: [{ type: String, required: true }]
    },
    AdministrativeDetails: {
        adminstrativeContact: { type: String, required: true },
        adminstrativeName: { type: String, required: true },

    },
    operationalHours: {
        from: { type: String, required: true },
        to: { type: String, required: true },
    },
    adress:{
        street:{type: String, required:true},
        city:{type: String, required:true},
        state:{type: String, required:true},
    
    },
    password:{type:String},
    role:{type:String},
})
module.exports = mongoose.model('hospitals', HospitalSchema)