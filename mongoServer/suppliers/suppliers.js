const mongoose = require('mongoose')
const Schema = mongoose.Schema

const supplierSchema = new Schema({
    supplierId: { type: String, replace: true },
    supplierDetails: {
        supplierName: { type: String, required: true },
        contactNumber: { type: String, required: true },
        email: { type: String, required: true },
        deliveryTime: { type: String, required: true },
        gstNumber: { type: String, required: true },
        medicineLicenseNumber:{ type: String},
    },
    adress: {
        city: { type: String, required: true },
        state: { type: String, required: true },
        adress: { type: String, required: true },
        zipcode: { type: String, required: true }
    },
    category: { type: String, required: true },
    
    status: { type: String, required: true }
})
module.exports = mongoose.model('suppliers', supplierSchema)