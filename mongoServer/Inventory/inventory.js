const mongoose = require('mongoose')
const Schema = mongoose.Schema



const InventorySchema = new Schema({
  inventoryId: { type: String, required: true }, // Keeping as String for flexibility
  category: { type: String, required: true },
  serviceName: { type: String, required: true },
  quantity: { type: Number, required: true }, // Changed to Number
  units: { type: String, required: true },
  quantityInStock: { type: Number, required: true }, // Changed to Number
  receivedDate: { type: Date, required: true }, // Changed to Date
  manufactureDate: { type: Date, required: true }, // Changed to Date
  expairyDate: { type: Date, required: true }, // Fixed typo and changed to Date
  minimumLevel: { type: Number, required: true }, // Changed to Number
  reorderLevel: { type: Number, required: true }, // Changed to Number
  storageLocation:{ type: String, required: true },
  criticalityLevel: { type: String, required: true }, // Assuming a 1-5 scale
  temperature: { type: String, required: true }, // Changed to Number
  supplierName: { type: String, required: true },
  contactNumber: { 
    type: String, 
    required: true, 
    validate: {
      validator: function (v) {
        return /\d{10}/.test(v); // Ensures a 10-digit contact number
      },
      message: props => `${props.value} is not a valid contact number!`
    }
  },
  email: { 
    type: String, 
    required: true, 
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address'] 
  },
  status: { type: String, required: true, enum: ['Active', 'Inactive'] },
  hospitalId:{type:String} // Limited to specific values
});



module.exports = mongoose.model('inventory', InventorySchema)