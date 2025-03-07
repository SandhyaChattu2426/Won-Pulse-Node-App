const mongoose = require('mongoose')
const Schema = mongoose.Schema

const userSchema = new Schema({
    user_id: {type:String},
    user_name:{type:String} ,
    role_id:{type:String},
    role_id:{type:String},
    first_name:{type:String},
    last_name:{type:String},
    title:{type:String},
    user_status: {type:String},
    selected_layout: {type:String},
    dashboard_layouts: {type:String},
    password: {type:String},
    login_key:{type:String},
    reset_password: {type:String},
    email: {type:String},
    time_zone:{type:String},
    contact: {type:String},
    location: {type:String},
    user_type: {type:String},
    email_otp:{type:String},
    phone_otp: {type:String},
    company_details:{type:String} ,
    is_mfa_enabled:{type:String}||"false",
    mfa_type: { type: [String], default: [] },
    passkey: {type:String},
    biometric_data: {type:String},
    authenticator_secret: {type:String},
});

module.exports=mongoose.model("user",userSchema)