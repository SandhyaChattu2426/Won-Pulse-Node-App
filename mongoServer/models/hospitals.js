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
        phNo: { type: String, },
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
        administrativeContact: { type: String, required: true },
        administrativeName: { type: String, required: true },
    },
    operationalHours: {
        from: { type: String, required: true },
        to: { type: String, required: true },
    },
    address: {
        street: { type: String, required: true },
        city: { type: String, required: true },
        state: { type: String, required: true },
        zipcode:{ type: String, required: true },

    },
    password: { type: String },
    role: { type: String },
    is_mfa_enabled: { type: String } || "false",
    mfa_type: { type: [String], default: [] },
    passkey: { type: String },
    socialMediaLinks: {
        linkedin: { type: String, default: "" },
        youtube: { type: String, default: "" },
        instagram: { type: String, default: "" },
        facebook: { type: String, default: "" },
    },
    bankDetails: {
        accountholdername: { type: String, default: "" },
        accountnumber: { type: String, default: "" },
        IFSCCode: { type: String, default: "" },
    },
    alerts: { type: String },
    business_type: { type: String, default: "" },
    hospitalSubCategory: { type: String, default: "" },
    razorpay_linked_account: { type: String, default: "" },
    razorpay_stake_holder: { type: String, default: "" },
    razorpay_product_id: { type: String, default: "" },
    razorpay_account_status: { type: String, default: "" },
    category:{type:String,default:""}

})
module.exports = mongoose.model('hospitals', HospitalSchema)