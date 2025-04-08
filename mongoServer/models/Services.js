const mongoose = require('mongoose')
const Schema = mongoose.Schema

const ServicesSchema=new Schema({
  services:{
    serviceId:{type:String,required:true},
    serviceName:{type:String,required:true},
    category:{type:String,required:true},
    subCategory:{type:String,required:true},
    tax:{type:String,required:true},
    unitPrice:{type:String,required:true},
    discount:{type:String,required:true},
    totalPrice:{type:String,required:true}
   },
   status:{type:String,required:true},
   pharmacyDetails: {
    type: {
        medicineCategory: { type: String },
        medicineName: { type: String },
        formulation: { type: String },
        strength: { type: String },
        units:{type:String} // Dosage strength, e.g., "500 mg"
    },
    required: function () {
        return this.services?.category === 'Pharmacy';
    },
},
  hospitalId:{type:String},
  AddedBy:{type:String},
  createdAt: {
    type: Date,
    default: Date.now // Automatically sets the date when the document is created
  },
  // write this function to update on Checking detailed View
  UpdatedBy:{type:String},
  UpdatedOn:{type:Date},
  referenceContactNumber:{type:String},
  referenceEmail:{type:String}
    
})
ServicesSchema.pre('save', function (next) {
  if (this.isModified()) {
    this.UpdatedOn = new Date();
  }
  next();
});

// 🔹 Auto-update `UpdatedOn` before update
ServicesSchema.pre('findOneAndUpdate', function (next) {
  this.set({ UpdatedOn: new Date() });
  next();
});


module.exports = mongoose.model('services', ServicesSchema)