const { response } = require('express')
const HttpError = require('../models/http-error')

const Pharmacy = require('./pharmacy')
const pharmacy = require('./pharmacy')

//Register Supplier

const RegisterMedicine = async (req, res, next) => {
    
    try {
       
        const newPharmacy = new Pharmacy({
            ...req.body,
        })
        await newPharmacy.save()
        //console.log("Medicine is registered SuccessFully,triggering try-block")
        //console.log(req.body)
    }
    catch (e) {
        //console.log(e,"error Here")
        //console.log("Catch-block")
    }
    res.json("medicine Registered Sucessfully")

}

// GETTing Details

const GetPharmacy = async (req, res, next) => {
    
    
    const {hospitalId} = req.params
    let List;
    try {
        List = await Pharmacy.find({hospitalId:hospitalId})
    }
    catch(e){
        //console.log(e)
    }
    res.json({List})
}

// GetId
const getId = async (req, res, next) => {
    let newPharmacyId;
    const str = "0";
    const { hospitalId } = req.params;

    try {
        // Fetch all medicines for the given hospitalId
        const medicines = await Pharmacy.find({ hospitalId });

        if (medicines.length > 0) {
            // Get the last medicine entry for this hospital, sorted by _id in descending order
            const lastMedicine = await Pharmacy.find({ hospitalId }).sort({ _id: -1 }).limit(1);

            if (lastMedicine.length > 0) {
                const lastMedicineId = lastMedicine[0].medicineId;

                // Extract numeric part and increment it
                const lastNumber = parseInt(lastMedicineId.substring(2)); // Assuming format: PH000001
                const nextNumber = lastNumber + 1;

                // Determine the number of leading zeros required for the new ID
                const zerosCount = 6 - nextNumber.toString().length;

                // Generate new medicine ID (e.g., PH000001, PH000002, ...)
                newPharmacyId = 'PH' + str.repeat(zerosCount) + nextNumber.toString();
            }
        } else {
            // If no medicine exists for this hospital, start with PH000001
            newPharmacyId = 'PH' + '0'.repeat(5) + "1";
        }

        console.log("Generated Medicine ID:", newPharmacyId);
        res.json({ id: newPharmacyId });
    } catch (err) {
        console.error("Error generating medicine ID:", err);
        return next(new HttpError("Couldn't fetch the pharmacy details", 500));
    }
};


// Get MedicineById

const getMedicineById = async (req, res, next) => {
    // //console.log('GET Request in Places')
    const medicineId = req.params.id
    // //console.log(patientId)
    //console.log(medicineId,"medicineId")
    let medicine;
    try {
        medicine = await Pharmacy.find({medicineId:medicineId})
        //console.log(medicine)
         //console.log("triggering tryblock")
    }
    catch (err) {
       
        //console.log("catch block")
        //console.log(err)
    }
    if (!medicine) {
        const error = new HttpError('Could not find a medicine for the Provided id.', 404)
        return next(error)

    }

    res.json({medicine})
}

// Update Status Of Inventory
const updateMedicineStatus = async (req, res, next) => {
    //console.log("Triggering update Medicine Status")

    try {
        //console.log("Updation Inventorystatus")
        const InId = req.params.Id
        // //console.log(StaffId,"here is")
        const medicine = await Pharmacy.findOne({ "medicineDetails.medicineId": InId })
        // //console.log(room,"Inventory Here")

        if (medicine) {
            try {
                medicine.status = req.body.status
                await medicine.save()
                return res.status(200).json({ message: "Pharmacy status updated successfully!" });

            } catch (e) {
                //console.log(e)
                //console.log("Could not find the patient")
            }
        }
    }
    catch (e) {
        //console.log(e)
    }
}

const getpharmaNames=async(req,res,next)=>{
    let InvList;
    try{
        InvList = await pharmacy.find({})
        res.send({
            pharmacyList:InvList.map(e=>({
                name:e.medicineDetails.medicineName
            }))
        })
    }catch(e){
        //console.log(e)
    }
}

const getPharmacyByName=async(req,res,next)=>{
    let List;
    const {name}=req.params 

    //console.log(name)//Paracetamol (e.g., Crocin, Tylenol)
    const sanitaizedName=name.trim()
    //console.log("triggering to get inv By name")
    try{
        InvList = await pharmacy.findOne({serviceName:sanitaizedName})
        //console.log(List,"List@") // getting null
    }
      catch(e){
        //console.log(e)
    }
    res.json({InvList})
}
// update PharmacyQuantity
const UpdatePharmacyQuantity = async (req, res, next) => {

    try {
        const usedItemList = req.body.pharmacyList
        const AllItems = await pharmacy.find({}) // All Items
        // const usedItems=req.body.usedItems
        // //console.log(AllItems,"Items")
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
        //console.log(e)
    }
}

const addPharmacyFromExcel = async (req, res, next) => {
    let last, lastId, newId;
    let createdItem;

    try {
        const totalItems = await Pharmacy.countDocuments();
        if (totalItems > 0) {
            last = await Pharmacy.findOne().sort({ _id: -1 });
            lastId = parseInt(last.medicineId.slice(2));
            //console.log(lastId, "lastid")
        } else {
            lastId = 0;
        }
        const prefix = "PH";
        const newNumber = lastId + 1;
        const paddedNumber = newNumber.toString().padStart(6, "0");
        newId = prefix + paddedNumber;
        //console.log(newId)
    } catch (err) {
        return next(new HttpError(`Creating report ID failed, Please try again. ${err}`, 500));
    }
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
            await createdItem.save()
            res.status(201).json({ item: createdItem });
        } catch (err) {
            return next(new HttpError(`Creating item failed, Please try again. ${err}`, 500));
        }
    }
}

const getChartData = async (req, res, next) => {
    const categoryColors = {
        "General": "rgba(76, 175, 80, 1)", // Green
        "Prescription": "rgba(149, 125, 205, 1)", // Purple
        "Lab-Inventories": "rgba(255, 167, 38, 1)", // Orange
        "Pharmacy": "rgba(76, 175, 80, 1)", // Green
        "General": "rgba(244, 67, 54, 1)" // Red
    };

    try {
        const inventoryData = await Pharmacy.aggregate([
            {
                $group: {
                    _id: {
                        category: "$category",
                        receivedMonth: { $month: "$receivedDate" }, // Extract month
                    },
                    totalQuantity: { $sum: "$quantity" } // Sum up quantities
                }
            },
            {
                $group: {
                    _id: "$_id.category",
                    data: {
                        $push: {
                            month: "$_id.receivedMonth",
                            totalQuantity: "$totalQuantity"
                        }
                    }
                }
            }
        ]);

        const allLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        let maxMonth = 0; // Initialize with zero (no data)

        const datasets = inventoryData.map(categoryData => {
            const monthData = new Array(12).fill(0);

            // Map received data to respective months
            categoryData.data.forEach(entry => {
                monthData[entry.month - 1] = entry.totalQuantity; // Adjust index (MongoDB months are 1-based)
                if (entry.month > maxMonth) {
                    maxMonth = entry.month; // Track the latest month with data
                }
            });

            return {
                label: categoryData._id, // Category name
                data: monthData.slice(0, maxMonth), // Trim data to the last available month
                borderColor: categoryColors[categoryData._id] || "rgba(0, 0, 0, 1)", // Default black if not found
                backgroundColor: categoryColors[categoryData._id]?.replace("1)", "0.3)") || "rgba(0, 0, 0, 0.3)" // Lighter for background
            };
        });

        // Trim labels up to the last month with data
        const labels = allLabels.slice(0, maxMonth);
        console.log(datasets,"Datas")
        

        res.json({ labels, datasets });
    } catch (error) {
        console.error("Error fetching inventory chart data:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

const getVaccinations=async (req,res,next)=>{
    const Items=await Pharmacy.find({formulation:"vaccine",hospitalId:req.hospitalid})
    res.json(Items)
}

const getPharmacyForBackend = async (medicineid, quantity, hospitalId) => {
    console.log(medicineid, quantity)
    try {
        const medicineItem = await Pharmacy.findOne({ medicineId: medicineid});

        if (medicineItem) {
            medicineItem.quantity -= quantity;
            await medicineItem.save();
        }

        if (!medicineItem) {
            throw new Error("Inventory item not found");
        }
        return true;
    } catch (error) {
        console.error("Error fetching inventory item:", error);
        throw error;
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
exports.getChartData=getChartData
exports.getVaccinations=getVaccinations
exports.getPharmacyForBackend=getPharmacyForBackend