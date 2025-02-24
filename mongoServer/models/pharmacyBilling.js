const mongoose = require('mongoose');



const pharmacyBillSchema = new mongoose.Schema({
    billId:{ type: String },
    patientName: { type: String, required: true },
    patientId: { type:String }, // Reference to a Patient model
    medicineList: [{
        medicineId: { type: String }, // Reference to a medicine collection if needed
        name: { type: String,  },
        tax:{ type: String,  },
        discount:{type: String, },
        
        quantity: { type: Number, },
        unitPrice: { type: Number, },
        totalPrice: { type: Number, }
    }],
    billValue:{ type: Number, },
    discount:{type: String, },
    paymentType:{type: String, },
    status:{ type: String }
}); // Adds createdAt & updatedAt fields


module.exports = mongoose.model('pharmacyBill', pharmacyBillSchema)
