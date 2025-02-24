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
  
  
    
})

module.exports = mongoose.model('services', ServicesSchema)