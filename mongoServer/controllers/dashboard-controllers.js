const dashboard = require('../models/Dashboard')

const GetDashboardData = async (req, res, next) => {
    console.log("triggeing GET Pharmacy")
    let List;
    try {
        List = await dashboard.find({})
    }
    catch (e) {
        console.log(e)
    }
    res.json({ List })
}

exports.GetDashboardData = GetDashboardData

