const mongoose = require('mongoose')
const Schema = mongoose.Schema


const ReportsSchema=new Schema({
    reportDetails:{
        reportId: {type:String,},
        category: {type:String,},
        serviceName: {type:String,},
        patientName: {type:String},
        collectionDate: {type:String},
        resultStatus: {type:String},
        testResults:{type:String},
        comments:{type:String},
        generationDate:{type:String},
        // serviceId:{type:mongoose.Types.ObjectId, required:true,ref:'services'}
    },
    hospitalId:{type:String,},
    status:{type:String},
})

module.exports = mongoose.model('reports', ReportsSchema)