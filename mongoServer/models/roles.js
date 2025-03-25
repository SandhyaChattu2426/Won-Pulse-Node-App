const mongoose = require('mongoose')
const Schema = mongoose.Schema

const RolesSchema=new Schema({
  roleId:{type:String},
  roleName:{type:String},
  description:{type:String},
  permissions:[{
    component:{type:String},
    action:{type:String}
  }],
  count:{type:Number,default:0},
  createdAt:{type:Date},
  hospitalId:{type:String}
}
)

module.exports = mongoose.model('roles', RolesSchema)