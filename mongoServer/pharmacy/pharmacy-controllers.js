const { response } = require('express')
const HttpError = require('../models/http-error')

const Pharmacy = require('./pharmacy')
const pharmacy = require('./pharmacy')

//Register Supplier

const RegisterMedicine = async (req, res, next) => {
    // const { supplierDetails, adress } = req.body
    
    try {
        console.log("pharmacy block is triggering")
        const newPharmacy = new Pharmacy({
            ...req.body,
        })
        await newPharmacy.save()
        console.log("Medicine is registered SuccessFully,triggering try-block")
        console.log(req.body)
    }
    catch (e) {
        console.log(e,"error Here")
        console.log("Catch-block")
    }
    res.json("medicine Registered Sucessfully")

}

// GETTing Details

const GetPharmacy = async (req, res, next) => {
    console.log("triggeing GET Pharmacy")
    let List;
    try {
        List = await Pharmacy.find({})
    }
    catch(e){
        console.log(e)
    }
    res.json({List})
}

// GetId
const getId = async (req, res, next) => {
    let newpharmacyId;
    let pharmaLength;
    const str = "0";
    
    console.log("Backend triggering to get ID");

    try {
        // Fetch all hospitals from the database
        const medicine = await Pharmacy.find({});

        if (medicine.length > 0) {
            // Get the last hospital document, sorted by _id in descending order
            const lastRoom = await Pharmacy.find({}).sort({ _id: -1 }).limit(1);

            // Extract the last hospital's hospitalId
            const lastRoomId = lastRoom[0].medicineId;
            
            // Calculate the next hospitalId based on the last one
            // Extract the numeric part of the last hospitalId (assuming the format is HP000001)
            const lastNumber = parseInt(lastRoomId.substring(2));  // Extracts the number part after 'HP'

            // Generate the next hospitalId (increment the last number)
            const nextNumber = lastNumber + 1;

            // Determine the number of leading zeros required for the new ID
            const zerosCount = 6 - nextNumber.toString().length;
            newRoomId = 'PH' + str.repeat(zerosCount) + nextNumber.toString();
        } else {
            // If no hospitals exist, create the first hospitalId
            newRoomId = 'PH' + '0'.repeat(5) + "1";  // HP000001
        }

        console.log("Generated Hospital ID:", newRoomId);
        res.json({ id: newRoomId });

    } catch (err) {
       console.log(err)
        
    }
};

// Get MedicineById

const getMedicineById = async (req, res, next) => {
    // console.log('GET Request in Places')
    const medicineId = req.params.id
    // console.log(patientId)
    console.log(medicineId,"medicineId")
    let medicine;
    try {
        medicine = await Pharmacy.find({medicineId:medicineId})
        console.log(medicine)
         console.log("triggering tryblock")
    }
    catch (err) {
       
        console.log("catch block")
        console.log(err)
    }
    if (!medicine) {
        const error = new HttpError('Could not find a medicine for the Provided id.', 404)
        return next(error)

    }

    res.json({medicine})
}

// Update Status Of Inventory
const updateMedicineStatus = async (req, res, next) => {
    console.log("Triggering update Medicine Status")

    try {
        console.log("Updation Inventorystatus")
        const InId = req.params.Id
        // console.log(StaffId,"here is")
        const medicine = await Pharmacy.findOne({ "medicineDetails.medicineId": InId })
        // console.log(room,"Inventory Here")

        if (medicine) {
            try {
                medicine.status = req.body.status
                await medicine.save()
                return res.status(200).json({ message: "Pharmacy status updated successfully!" });

            } catch (e) {
                console.log(e)
                console.log("Could not find the patient")
            }
        }
    }
    catch (e) {
        console.log(e)
    }
}

const getpharmaNames=async(req,res,next)=>{
    console.log("pharmacy Names Here")
    let InvList;
    try{
        InvList = await pharmacy.find({})
        console.log({
            InventoryList:InvList.map(e=>({
                name:e.medicineDetails.medicineName
            }))})

        res.send({
            pharmacyList:InvList.map(e=>({
                name:e.medicineDetails.medicineName
            }))
          
        })
    }catch(e){
        console.log(e)
    }
}

const getPharmacyByName=async(req,res,next)=>{
    let List;
    const {name}=req.params 

    console.log(name)//Paracetamol (e.g., Crocin, Tylenol)
    const sanitaizedName=name.trim()
    console.log("triggering to get inv By name")
    try{
        InvList = await pharmacy.findOne({serviceName:sanitaizedName})
        console.log(List,"List@") // getting null
    }
      catch(e){
        console.log(e)
    }
    res.json({InvList})
}
// update PharmacyQuantity
const UpdatePharmacyQuantity = async (req, res, next) => {

    console.log("prabhuva")
    try {
        const usedItemList = req.body.pharmacyList
        const AllItems = await pharmacy.find({}) // All Items
        // const usedItems=req.body.usedItems
        // console.log(AllItems,"Items")
        for (const Item of usedItemList) {
            const id = Item.medicineId;
            const usedQuantity = Item.quantity
            const InvItem = await pharmacy.findOne({ medicineId: id })
            if (InvItem) {
                if (InvItem.quantity>= usedQuantity) {
                    InvItem.quantity -= usedQuantity
                    await InvItem.save()
                }
                else {
                    res.json("could not updated")
                }
            }
            else {
                res.json("couldn't found the details")
            }
        }

    } catch (e) {
        console.log(e)
    }
}

const addPharmacyFromExcel = async (req, res, next) => {
    console.log("Triggering here")
    let last, lastId, newId;
    let createdItem;

    try {
        const totalItems = await Pharmacy.countDocuments();
        if (totalItems > 0) {
            last = await Pharmacy.findOne().sort({ _id: -1 });
            lastId = parseInt(last.medicineId.slice(2));
            console.log(lastId, "lastid")
        } else {
            lastId = 0;
        }
        const prefix = "PH";
        const newNumber = lastId + 1;
        const paddedNumber = newNumber.toString().padStart(6, "0");
        newId = prefix + paddedNumber;
        console.log(newId)
    } catch (err) {
        return next(new HttpError(`Creating report ID failed, Please try again. ${err}`, 500));
    }

    // Validate inputs
    // const errors = validationResult(req);
    // if (!errors.isEmpty()) {
    //     return next(new HttpError("Invalid inputs passed, please check your data", 422));
    // }

    console.log(req.body, "request")
    // let {
    //     staffId:req.body.,
    //     fullName:req.body.,
    //     dateOfBirth:req.body.,
    //     gender:req.body.,
    //     email:req.body.,
    //     contactNumber:req.body.,
    //     street:req.body.,
    //     city:req.body.,
    //     state:req.body.,
    //     zipcode:req.body.,
    //     jobRole:req.body.,
    //     department:req.body.,
    //     employmentType:req.body.,
    //     qualification:req.body.,
    //     nightShift:req.body.,
    //     online:req.body.,
    //     status:req.body.,

    // } = req.body;


    //  try {
    //     let existingItem;

    //     // ✅ 1️⃣ Check for existing item using `item_id`
    //     if (req.body.reportId) {
    //         existingItem = await Reports.findOne({ item_id });
    //     }

    //     if (existingItem) {
    //         // ✅ Update existing item by `item_id`
    //         const updatedItem = await Reports.findOneAndUpdate(
    //             { item_id },
    //             { $set: req.body },
    //             { new: true }
    //         );

    //         return res.status(200).json({
    //             message: "Item updated successfully.",
    //             updatedItem,
    //         });
    //     } else {
    //         // ✅ 2️⃣ If no `item_id`, check for existing item by `item_category` and `item_brand`
    //         existingItem = await Reports.findOne({
    //             item_name,
    //             item_brand,
    //         });

    //         if (existingItem) {
    //             // ✅ If found, update the existing record
    //             const updatedItem = await Reports.findOneAndUpdate(
    //                 { item_name, item_brand },
    //                 { $set: req.body },
    //                 { new: true }
    //             );

    //             return res.status(200).json({
    //                 message: "Item updated successfully.",
    //                 updatedItem,
    //             });
    //         }
    //     }
    // } catch (err) {
    //     return next(new HttpError(`Error checking for existing item: ${err}`, 500));
    // }

    // Create a new inventory item
    // const existItem = await Inventory.findOne({ servicename: req.body.serviceName });  // You can use email or staffId for uniqueness
    // if (existItem) {
    //     return res.status(400).json({ message: "Item already exists.." });
    // }


    createdItem = new Pharmacy({
        medicineId:newId,
        category:req.body.category,
        subCategory:req.body.subcategory,
        serviceName:req.body.servicename,
        quantity:req.body.quantity,
        units:req.body.units,
        quantityInStock:req.body.quantityinstock,
        receivedDate:req.body.receiveddate,
        manufactureDate: req.body.manufacturedate,
        expairyDate: req.body.expairydate,
        minimumStockLevel:req.body.minimumstocklevel,
        reorderLevel:req.body.reorderlevel,
        location:req.body.location,
        criticalityLevel:req.body.criticalitylevel,
        temperature:req.body.temperature,
        supplierName:req.body.suppliername,
        contactNumber:req.body.contactnumber,
        email:req.body.email,
        medicineLicenceNo:req.body.medicinelicenceno,
        status:"Active"
    })

    if (!req.body.servicename || !req.body.quantity || !req.body.units || !req.body.category || !req.body.minimumstocklevel || !req.body.criticalitylevel || !req.body.status) {
        return res.status(400).send({ message: "Incomplete Pharmacy details." });
    }
    else {
        try {
            // const sess = await mongoose.startSession();
            // sess.startTransaction();
            // await createdItem.save({ session: sess });
            // await sess.commitTransaction();
            // sess.endSession();

            await createdItem.save()
            res.status(201).json({ item: createdItem });
        } catch (err) {
            return next(new HttpError(`Creating item failed, Please try again. ${err}`, 500));
        }
    }
}


exports.RegisterMedicine = RegisterMedicine
exports.getId=getId
exports.GetPharmacy=GetPharmacy
exports.getMedicineById=getMedicineById
exports.updateMedicineStatus=updateMedicineStatus
exports.getpharmaNames=getpharmaNames
exports.getPharmacyByName=getPharmacyByName
exports.UpdatePharmacyQuantity=UpdatePharmacyQuantity
exports.addPharmacyFromExcel=addPharmacyFromExcel
