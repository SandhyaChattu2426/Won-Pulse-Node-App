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
    },
    hospitalId:{type:String,},
    patientId:{type:String,},

    status:{type:String},
    files:[{
        name:{type:String},
        url:{type:String}
    }],
}
)

module.exports = mongoose.model('reports', ReportsSchema)