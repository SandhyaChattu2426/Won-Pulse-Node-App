// import PharmaBillingRequests from '../models/PharmaBillingRequests'

const HttpError = require('../models/http-error')
const PharmaBillingRequests = require('../models/PharmaBillingRequests')


const CreateRequest = async (req, res, next) => {
  console.log("Triggering");
  try {
    const count = await PharmaBillingRequests.countDocuments();
    const newID = count === 0 ? "1" : (count + 1).toString();

    const newRequest = new PharmaBillingRequests({
      ...req.body,
      requestId: newID
    });

    await newRequest.save();
    res.json("Bill request Created Successfully");
  } catch (e) {
    console.log(e);
    res.status(500).json({ error: "Failed to create bill request" });
  }
};

const GetNotifiedBills = async (req, res, next) => {
  // const {hospitalId}=req.params
  try {
    const docs = await PharmaBillingRequests.find({ status: "Pending" });
    res.json({ Bills: docs });
  } catch (e) {
    console.error("Error fetching pending bills:", e);
    res.status(500).json({ error: "Internal Server Error" });

  }
};

const GetBillRequestById = async (req, res) => {
  const { hospitalId, id } = req.params

  console.log("triggering",id)
  try {
    const request = await PharmaBillingRequests.findOne({ requestId: id })
    console.log(request)
    res.json({ request: request })
  } catch (e) {
    console.log(e)
  }
}


exports.CreateRequest = CreateRequest
exports.GetNotifiedBills = GetNotifiedBills
exports.GetBillRequestById = GetBillRequestById