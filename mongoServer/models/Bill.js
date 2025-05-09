const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const billItemSchema = new Schema({
  id: { type: String, required: true },
  productOrService: { type: String, required: true },
  unitPrice: { type: Number, required: true },
  discount: { type: Number, default: 0 },
  tax: { type: Number, default: 0 },
  quantity: { type: Number, default: 1 },
  total: { type: Number, required: true },
  paymentType: { type: String, required: true },
  paymentStatus: { type: String, required: true },
});

const BillSchema = new Schema({
  billId: { type: String },
  patientId: { type: String, required: true },
  patientName: { type: String, required: true },

  billItem: [billItemSchema],
  paymentType: { type: String, required: true }, // e.g., "Cash", "Card"
  status: { type: String, required: true }, // e.g., "Paid", "Pending"
  hospitalId: { type: String, required: true },
  totalPrice: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('GeneralBill', BillSchema);
