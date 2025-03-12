const mongoose = require('mongoose')
// const patient = require('./patient')
const Schema = mongoose.Schema

const dashboardSchema = new Schema({
  tableName:{type:String},
  tableKeys:[{
    type:String
  }]
  
})

module.exports = mongoose.model('GroupByCollection', dashboardSchema)