const mongoose = require('mongoose')

const Schema = mongoose.Schema

const filterConditions = new Schema({
    filter_id: { type: Number, },
    column: { type: String, },
    operation: { type: String, },
    value: { type: String, },
})

// const forObject= new Schema({
//     label:{type:String,},
//     value:{type:String,},
// })

const reportsSchema = new Schema({
    report_id: { type: String, },
    report_title: { type: String, },
    selected_table: { type: String, },
    group_by: { type: String, },
    stack_by: { type: String, },
    aggregation: { type: String, },
    date_label: { type: String,default:null },
    visibility: { type: String, },
    gauge_report_fields: { type: String, },
    display_table: { type: String, },
    short_description: { type: String, },
    view: { type: String, },
    filter_conditions: [filterConditions],
    type: { type: String, },
    created_by: { type: String, },
    created_on: { type: String, },
    interval_duration: { type: String, },
    last_modified_date: { type: String, },
    last_modified_by: { type: String, },

    // creator: { type: mongoose.Types.ObjectId, required: true, ref: 'User' }
})

module.exports = mongoose.model('DashboardReports', reportsSchema)