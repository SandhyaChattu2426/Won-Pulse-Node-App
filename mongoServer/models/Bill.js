const mongoose = require('mongoose')
// const patient = require('./patient')
const Schema = mongoose.Schema

const BillSchema = new Schema({
    billId: { type: String },

    patientId: { type: String, required: true },
    patientName: { type: String, required: true },

    medicineList: [{
        Id: { type: String }, // Reference to a medicine collection if needed
        type: { type: String, },
        price: { type: String, },
        discount: { type: String, },
        total: { type: String }

    }],
    AdmissionList: [{
        id: { type: String }, // Reference to a medicine collection if needed
        name: { type: String, },
        quantity: { type: String, },
        tax: { type: String, },
        unitPrice: { type: String },
        totalPrice: { type: String },
    }],
    // you are not updated in the Post request complete it, and you had to update the status also

    paymentType: { type: String, required: true },
    status: { type: String, required: true }

})

module.exports = mongoose.model('generalBill', BillSchema)