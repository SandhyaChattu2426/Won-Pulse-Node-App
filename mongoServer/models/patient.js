const mongoose = require('mongoose')
const Schema = mongoose.Schema

const patientSchema = new Schema({
        patientId:{ type: String, required: true },
        firstName: { type: String, required: true },
        LastName: { type: String, required: true },
        dateOfBirth: { type: String, required: true },
        gender: { type: String,required: true  },
        email:{ type: String, required: true },
        contactNumber:{type:String,},
        emergencyContactName: { type: String, required: true },
        emergencyContactNumber: { type: String, },
        street: { type: String, required: true },
        city: { type: String, required: true },
        state: { type: String, required: true },
        zipcode: { type: String, required: true },
        insuranceProvider: { type: String, required: true },
        policyNumber: { type: String, required: true },
        policyHoldersName: { type: String, required: true },
        relation: { type: String, required: true },
        currentMedicine: { type: String, required: true },
        previousSurgeries: { type: String, required: true },
         chronicConditions: { type: String, required: true },
         reasonsForVisit:{type:String, required:true },
        prefferedCommunications: {type:[String],
        enum:['email','sms','socialMedia','call'],
        default:[]
    },
    status:{type:String,required:true},
    appointments: [
        {
           doctorName:String,
            appointmentId:String,
            appointmentDate:String,
            status: { type: String, default: "Scheduled" }
        }
    ],
    reports:[{
        reportName:String,
        reportId:String,
        uploadedOn:String,
        testResults:String,
        resultStatus:String,

    }],
    registrationFiles:[{}],
    hospitalId:{type:String},
    fullName:{type:String}
})

module.exports = mongoose.model('Patient', patientSchema)