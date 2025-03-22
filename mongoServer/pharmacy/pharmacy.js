const mongoose = require('mongoose')
const Schema = mongoose.Schema

const pharmacySchema = new Schema({
    medicineId: { type: String, required: true },
    category: { type: String, required: true },
    subCategory: { type: String, required: true },
    serviceName: { type: String, required: true },
    quantity: { type: Number, required: true },
    units: { type: String, required: true },
    quantityInStock: { type: Number, required: true },
    receivedDate: { type: String, required: true },
    manufactureDate: { type: Date, required: true },
    expairyDate: { type: Date, required: true },
    minimumStockLevel: { type: Number, required: true },
    reorderLevel: { type: Number, required: true },
    location: { type: String, required: true },
    criticalityLevel: { type: String, required: true },
    temperature: { type: String, required: true },
    supplierName: { type: String, required: true },
    contactNumber: { type: String, required: true },
    email: { type: String, required: true },
    medicineLicenceNo: { type: String, required: true },
    status: { type: String, required: true },
    hospitalId: { type: String },
    AddedBy: { type: String },
    createdAt: {
        type: Date,
        default: Date.now // Automatically sets the date when the document is created
    },
    // write this function to update on Checking detailed View
    UpdatedBy: { type: String },
    UpdatedOn: { type: Date },
})
module.exports = mongoose.model('pharmacy', pharmacySchema)