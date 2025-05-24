const { response } = require('express')
const HttpError = require('../models/http-error')
const Suppliers = require('./suppliers')
const suppliers = require('./suppliers')

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
    const { hospitalId } = req.params
    let List;
    try {
        List = await Suppliers.find({ hospitalId })
    }
    catch (e) {
        console.log(e)
    }
    res.json({ List })
}
// GetId
const getId = async (req, res, next) => {
    const { hospitalId } = req.params
    let newSupplierId;
    let SuppliersLength;
    const str = "0";

    console.log("Backend triggering to get ID");

    try {
        // Fetch all hospitals from the database
        const suppliers = await Suppliers.find({ hospitalId });

        if (suppliers.length > 0) {
            // Get the last hospital document, sorted by _id in descending order
            const lastSupplier = await Suppliers.find({ hospitalId }).sort({ _id: -1 }).limit(1);

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
const InventorySuppliers = async (req, res, next) => {
    // console.log("Inventory Suppliers")
    let List;
    try {
        List = await Suppliers.find({ "category": "inventory" })
        // console.log(List)
    }
    catch (e) {
        console.log(e)
    }
    res.json({ List })
}

const GetSupplierById = async (req, res, next) => {
    const { Id } = req.params
    let List;
    try {
        List = await Suppliers.findOne({ "supplierId": Id })
    }
    catch (e) {
        console.log(e)
    }
    res.json({ List })
}
const PharmacySuppliers = async (req, res, next) => {
    console.log("pharmacy Suppliers")
    let List;
    try {
        List = await Suppliers.find({ "category": "pharmacy" })
        // console.log(List)
    }
    catch (e) {
        console.log(e)
    }
    res.json({ List })
}
const addSupplierFromExcel = async (req, res, next) => {
    console.log("Triggering here");

    let last, lastId, newId;
    let createdItem;

    try {
        const totalItems = await suppliers.countDocuments();
        if (totalItems > 0) {
            last = await suppliers.findOne().sort({ _id: -1 });
            lastId = parseInt(last.supplierId.slice(2));
        } else {
            lastId = 0;
        }

        const prefix = "SU";
        const newNumber = lastId + 1;
        const paddedNumber = newNumber.toString().padStart(6, "0");
        newId = prefix + paddedNumber;
    } catch (err) {
        return next(new HttpError(`Creating Supplier ID failed, Please try again. ${err}`, 500));
    }

    console.log(req.body, "request");
    const {
        SupplierName,
        ContactNumber,
        Email,
        DeliveryTime,
        GstNumber,
        MedicineLicenseNumber,
        City,
        State,
        Adress,
        Zipcode,
        Category,
        Status,
        hospitalId,
        AddedBy
    } = req.body;

    try {
        const existingSupplier = await suppliers.findOne({
            "supplierDetails.email": Email,
            "supplierDetails.contactNumber": ContactNumber,
        });

        if (existingSupplier) {
            return res.status(409).json({ message: "Supplier already exists with the same email and contact number." });
        }
    } catch (err) {
        return next(new HttpError(`Checking existing suppliers failed, Please try again. ${err}`, 500));
    }

    const createdSupplier = new suppliers({
        supplierId: newId,
        supplierDetails: {
            supplierName: SupplierName,
            contactNumber: ContactNumber,
            email: Email,
            deliveryTime: DeliveryTime,
            gstNumber: GstNumber,
            medicineLicenseNumber: MedicineLicenseNumber || ""
        },
        adress: {
            city: City,
            state: State,
            adress: Adress,
            zipcode: Zipcode
        },
        category: Category,
        status: Status,
        hospitalId: hospitalId || "",
        AddedBy: AddedBy || ""
    });

    try {
        createdItem = await createdSupplier.save();
        res.status(201).json({ item: createdItem });
    } catch (err) {
        return next(new HttpError(`Creating Supplier failed, Please try again. ${err}`, 500));
    }
};

const updateSupplierStatus = async (req, res, next) => {
    console.log("Triggering here")
    try {
        const { id, hospitalId } = req.params
        const supplier = await suppliers.findOne({ supplierId: id, hospitalId: hospitalId })
        if (supplier) {
            try {
                supplier.status = req.body.status
                await supplier.save()
                return res.status(200).json({ message: "supplier status updated successfully!" });

            } catch (e) {
                console.log(e, "error @supplier ")
                console.log("Could not find the patient")
            }
        }
    }
    catch (e) {
        console.log(e)
    }
}




exports.RegisterSupplier = RegisterSupplier
exports.GetSuppliers = GetSuppliers
exports.getId = getId
exports.InventorySuppliers = InventorySuppliers
exports.GetSupplierById = GetSupplierById
exports.PharmacySuppliers = PharmacySuppliers
exports.addSupplierFromExcel = addSupplierFromExcel
exports.updateSupplierStatus = updateSupplierStatus
