const mongoose = require('mongoose')
const Schema = mongoose.Schema

const roomsScheema = new Schema({

    roomId: { type: String, required: true },
    roomNumber: { type: String, required: true },
    category: { type: String, required: true },
    roomType: { type: String, required: true },
    roomCharge: { type: String, required: true },
    status: { type: String, required: true },
    hospitalId:{type:String},
    createdBy: { type: String },
    createdAt: {
        type: Date,
        default: Date.now // Automatically sets the date when the document is created
    },
})
module.exports = mongoose.model('rooms', roomsScheema)