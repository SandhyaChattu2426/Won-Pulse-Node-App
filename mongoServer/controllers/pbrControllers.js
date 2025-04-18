// import PharmaBillingRequests from '../models/PharmaBillingRequests'

const HttpError = require('../models/http-error')
const PharmaBillingRequests = require('../models/PharmaBillingRequests')


const CreateRequest = async (req, res, next) => {
  try {
    const count = await PharmaBillingRequests.countDocuments();
    const numericId = count === 0 ? 1 : count + 1;
    const paddedId = `PHR${numericId.toString().padStart(6, '0')}`;

    const newRequest = new PharmaBillingRequests({
      ...req.body,
      requestId: paddedId
    });

    await newRequest.save();
    res.json("Bill request Created Successfully");
  } catch (e) {
    console.log(e);
    res.status(500).json({ error: "Failed to create bill request" });
  }
};


const GetNotifiedBills = async (req, res, next) => {
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

  try {
    const request = await PharmaBillingRequests.findOne({ requestId: id })
    res.json({ request: request })
  } catch (e) {
    console.log(e)
  }
}

const UpdateStatus=async(req,res,next)=>{
  try{
  const request=await PharmaBillingRequests.findOne({requestId:req.params.id})
  request.status="resolved"
  await request.save()
  }catch(e){
    console.log(e,"error")
  }
}

exports.CreateRequest = CreateRequest
exports.GetNotifiedBills = GetNotifiedBills
exports.GetBillRequestById = GetBillRequestById
exports.UpdateStatus=UpdateStatus