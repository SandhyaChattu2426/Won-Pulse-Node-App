const mongoose = require('mongoose');



const pharmacyBillSchema = new mongoose.Schema({
    billId:{ type: String },
    patientName: { type: String, required: true },
    patientId: { type:String }, 
    medicineList: [{
        medicineId: { type: String }, 
        name: { type: String,  },
        tax:{ type: String,  },
        discount:{type: String, },
        quantity: { type: Number, },
        unitPrice: { type: Number, },
        totalPrice: { type: Number, }
    }],
    billValue:{ type: String, },
    discount:{type: String, },
    paymentType:{type: String, },
    status:{ type: String },
    hospitalId:{type: String},
    chequeNo:{type:String}
}); 


module.exports = mongoose.model('pharmacyBill', pharmacyBillSchema)
