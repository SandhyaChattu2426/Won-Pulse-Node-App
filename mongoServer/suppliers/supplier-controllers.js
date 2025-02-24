const { response } = require('express')
const HttpError = require('../models/http-error')
const Suppliers=require('./suppliers')

//Register Supplier

const RegisterSupplier = async (req, res, next) => {
    const { supplierDetails, adress } = req.body
    console.log("Supplier block is triggering")
    const newsupplier = new Suppliers({
       ...req.body,
    })

    try {
        await newsupplier.save()
        console.log("Supplier is registered SuccessFully,triggering try-block")
        console.log(req.body)
    }
    catch (e) {
        console.log(e)
        console.log("Catch-block")
    }
    res.json("supplier Created Sucessfully")

}

// GETTing Details

const GetSuppliers = async (req, res, next) => {
     console.log("triggeing GET SUppliers")
    let List;
    try {
        List = await Suppliers.find({})
    }
    catch(e){
        console.log(e)
    }
    res.json({List})
}

// GetId
const getId = async (req, res, next) => {
    let newSupplierId;
    let SuppliersLength;
    const str = "0";
    
    console.log("Backend triggering to get ID");

    try {
        // Fetch all hospitals from the database
        const suppliers = await Suppliers.find({});

        if (suppliers.length > 0) {
            // Get the last hospital document, sorted by _id in descending order
            const lastSupplier = await Suppliers.find({}).sort({ _id: -1 }).limit(1);

            // Extract the last hospital's hospitalId
            const lastSupplierId = lastSupplier[0].supplierId;
            
            // Calculate the next hospitalId based on the last one
            // Extract the numeric part of the last hospitalId (assuming the format is HP000001)
            const lastNumber = parseInt(lastSupplierId.substring(2));  // Extracts the number part after 'HP'

            // Generate the next hospitalId (increment the last number)
            const nextNumber = lastNumber + 1;

            // Determine the number of leading zeros required for the new ID
            const zerosCount = 6 - nextNumber.toString().length;
            newSupplierId = 'SU' + str.repeat(zerosCount) + nextNumber.toString();
        } else {
            // If no hospitals exist, create the first hospitalId
            newSupplierId = 'SU' + '0'.repeat(5) + "1";  // HP000001
        }

        console.log("Generated Hospital ID:", newSupplierId);
        res.json({ id: newSupplierId });

    } catch (err) {
        console.log(err)
        const error = new HttpError("Couldn't fetch the hospital details", 500);
        return next(error);
    }
};


const InventorySuppliers=async(req,res,next)=>{
    // console.log("Inventory Suppliers")
    let List;
    try {
        List = await Suppliers.find({"category":"inventory"})
        // console.log(List)
    }
    catch(e){
        console.log(e)
    }
    res.json({List})
}


const GetSupplierById=async(req,res,next)=>{
    console.log("Triggering to fetch supplier Details")
    console.log(req.params)
    const {Id}=req.params
    let List;
    try {
        List = await Suppliers.findOne({"supplierId":Id})
        console.log(List)
    }
    catch(e){
        console.log(e)
    }
    res.json({List})
}



const PharmacySuppliers=async(req,res,next)=>{
    console.log("pharmacy Suppliers")
    let List;
    try {
        List = await Suppliers.find({"category":"pharmacy"})
        // console.log(List)
    }
    catch(e){
        console.log(e)
    }
    res.json({List})
}





exports.RegisterSupplier = RegisterSupplier
exports.GetSuppliers=GetSuppliers
exports.getId=getId
exports.InventorySuppliers=InventorySuppliers
exports.GetSupplierById=GetSupplierById
exports.PharmacySuppliers=PharmacySuppliers
