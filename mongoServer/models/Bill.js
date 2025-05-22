const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const BillSchema = new Schema({
  billId: { type: String },
  patientId: { type: String, required: true },
  patientName: { type: String, required: true },

  billItems: [{
  id: { type: String, },
  productOrService: { type: String, },
  unitPrice: { type: Number, },
  discount: { type: Number,  },
  tax: { type: Number, default: 0 },
  quantity: { type: Number, default: 1 },
  totalPrice: { type: Number },
  paymentType: { type: String} ,
  paymentStatus : { type: String , default: "pending"},
  itemId: { type: String},
  admissionId: { type: String },
}],
  paymentType: { type: String, required: true }, // e.g., "Cash", "Card"
  status: { type: String, required: true }, // e.g., "Paid", "Pending"
  hospitalId: { type: String, required: true },
  totalPrice: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('GeneralBill', BillSchema);
