const HttpError = require('../models/http-error')
const Inventory = require('./inventory')

//CREATE INVENTORY
const createInventory = async (req, res, next) => {
    console.log("Create Inventory  Triggered")
    const newInventory = new Inventory({
        ...req.body
    })
    //  console.log(req.body)
    try {
        await newInventory.save()
    }
    catch (e) {
        console.log(e, "error from the catch block")
        return new HttpError("Can not created", 501)
    }
    res.send("inventory Created Successfully")

}

//GETTING ID
const getId = async (req, res, next) => {
    let newInId;
    let InLength;
    const str = "0";

    console.log("Backend triggering to get ID");

    try {

        const inv = await Inventory.find({});
        if (inv.length > 0) {
            // Get the last hospital document, sorted by _id in descending order
            const lastRoom = await Inventory.find({}).sort({ _id: -1 }).limit(1);

            // Extract the last hospital's hospitalId
            const lastRoomId = lastRoom[0].inventoryId;

            // Calculate the next hospitalId based on the last one
            // Extract the numeric part of the last hospitalId (assuming the format is HP000001)
            const lastNumber = parseInt(lastRoomId.substring(2));  // Extracts the number part after 'HP'

            // Generate the next hospitalId (increment the last number)
            const nextNumber = lastNumber + 1;

            // Determine the number of leading zeros required for the new ID
            const zerosCount = 6 - nextNumber.toString().length;
            newRoomId = 'IN' + str.repeat(zerosCount) + nextNumber.toString();
        } else {
            // If no hospitals exist, create the first hospitalId
            newRoomId = 'IN' + '0'.repeat(5) + "1";  // HP000001
        }

        console.log("Generated Hospital ID:", newRoomId);
        res.json({ id: newRoomId });

    } catch (err) {
        console.log(err)

    }
};

//GetALL
const gettingALLInventories = async (req, res, next) => {
    let InventoryList
    try {
        InventoryList = await Inventory.find({})

    }
    catch (e) {
        console.log(e)
    }
    res.json({ InventoryList })
}

//Get Inventory By Id

const getInventoryById = async (req, res, next) => {
    const { Id } = req.params
    console.log(Id,"here")
    let Item;
    try {
        Item = await Inventory.findOne({ inventoryId: Id })
        console.log(Item)
    } catch (e) {
        console.log(e)
    }
    console.log("triggering BY jesus grace")
    res.json(Item)
}

// Update Inventory

const UpdateInventoryDetails = async (req, res, next) => {
    const { Id } = req.params
    console.log(req.body)
    console.log(req.params)
    let Item;
    console.log(req.body)
    console.log("Updating request triggering in the backend")
    const { quantity } = req.body
    try {
        Item = await Inventory.findOne({ inventoryId: Id })
        // console.log(Item)
    }
    catch (e) {
        console.log(e)
        return next("Can not get Inventory Details", 404)
    }
    try {
        // Item.supplierInformation = supplierInformation
        // Item.inventoryName = inventoryName
        // Item.inventoryCategory = inventoryCategory
        // Item.addInventoryDetails = addInventoryDetails
        // Item.inventoryId = inventoryId
        Item.quantity = Item.quantity + quantity

        await Item.save()
        console.log(Item)
    } catch (e) {
        console.log(e)
        return next("Could not be updated", 404)
    }
    res.send("updated Successfully", 201)
}


// Update Status
const updateInventoryStatus = async (req, res, next) => {
    // console.log("Triggering update Inventory Status")

    try {
        // console.log("Updation Inventorystatus")
        const InId = req.params.Id
        console.log(InId)
        const room = await Inventory.findOne({ "inventoryDetails.inventoryId": InId })
        console.log(room.status, "BeforeUpdate")
        console.log(req.body)
        if (room) {
            try {
                room.status = req.body.status
                await room.save()
                console.log(room, "AfterUpdate")
                return res.status(200).json({ message: "room status updated successfully!" });

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

// Update InventoryQuantity accepting List

const UpdateInventoryQuantity = async (req, res, next) => {

    console.log(req.body.InvItemList)
    try {
        const usedItemList = req.body.InvItemList
        const AllItems = await Inventory.find({}) // All Items
        // const usedItems=req.body.usedItems
        // console.log(AllItems,"Items")
        for (const Item of usedItemList) {
            const id = Item.Id;
            const usedQuantity = Item.quantity
            const InvItem = await Inventory.findOne({ inventoryId: id })
            if (InvItem) {
                if (InvItem.stockQuantity >= usedQuantity) {
                    InvItem.stockQuantity -= usedQuantity
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

const getInvNames = async (req, res, next) => {
    console.log("Inv Names Here")
    let InvList;
    try {
        InvList = await Inventory.find({})
        console.log({
            InventoryList: InvList.map(e => ({
                name: e.inventoryDetails.inventoryName
            }))
        })

        res.send({
            InventoryList: InvList.map(e => ({
                name: e.inventoryDetails.inventoryName
            }))

        })
    } catch (e) {
        console.log(e)
    }
}

const getInventoryByName = async (req, res, next) => {
    let List;
    const { name } = req.params
    console.log(name)
    console.log("triggering to get inv By name")
    try {
        List = await Inventory.findOne({ "serviceName": name })
        console.log(List)

    } catch (e) {
        console.log(e)
    }
    res.json({ List })
}

const updateQuantity = async (req, res, next) => {
    const { Id } = req.params
    console.log(req.body)
    const item = await Inventory.findById(Id);
    console.log(item, "item")
}

const addInventoryFromExcel = async (req, res, next) => {
    // console.log("Triggering here")
    let last, lastId, newId;
    let createdItem;
    function excelDateToJSDate(serialDate) {
        const jsonDate= new Date((serialDate - 25569) * 86400 * 1000);
        return jsonDate.toISOString().split("T")[0];
    }

    try {
        const totalItems = await Inventory.countDocuments();
        if (totalItems > 0) {
            last = await Inventory.findOne().sort({ _id: -1 });
            lastId = parseInt(last.inventoryId.slice(2));
            console.log(lastId, "lastid")
        } else {
            lastId = 0;
        }

        const prefix = "IN";
        const newNumber = lastId + 1;
        const paddedNumber = newNumber.toString().padStart(6, "0");
        newId = prefix + paddedNumber;
    } catch (err) {
        return next(new HttpError(`Creating report ID failed, Please try again. ${err}`, 500));
    }

    createdItem = new Inventory({
        inventoryId: newId, // Keeping as String for flexibility
        category: req.body.category,
        serviceName: req.body.servicename,
        quantity: req.body.quantity, // Changed to Number
        units: req.body.units,
        quantityInStock: req.body.quantityinstock, // Changed to Number
        receivedDate: excelDateToJSDate(req.body.receiveddate),
        manufactureDate: excelDateToJSDate(req.body.manufacturedate),
        expairyDate: excelDateToJSDate(req.body.expairydate),
        minimumLevel: req.body.minimumlevel, // Changed to Number
        reorderLevel: req.body.reorderlevel, // Changed to Number
        storageLocation: req.body.storagelocation,
        criticalityLevel: req.body.criticalitylevel, // Assuming a 1-5 scale
        temperature: req.body.temperature, // Changed to Number
        supplierName: req.body.suppliername,
        contactNumber: req.body.contactnumber,
        email:req.body.email,
        status:"Active"|| ""
    })

    if (!req.body.servicename || !req.body.quantity || !req.body.units || !req.body.category || !req.body.minimumlevel || !req.body.criticalitylevel || !req.body.status) {
        return res.status(400).send({ message: "Incomplete Inventory details." });
    }
    else {
        try {
        
            // console.log(createdItem,"Item Here")
            // console.log(new Date(req.body.receivedDate),req.body.receivedDate)// Invalid Date undefined
            await createdItem.save()
            res.status(201).json({ item: createdItem });
        } catch (err) {
            return next(new HttpError(`Creating item failed, Please try again. ${err}`, 500));
        }
    }
}

const getChartData = async (req, res, next) => {
    // Predefined color map for categories
    const categoryColors = {
        "Equipment": "rgba(76, 175, 80, 1)", // Green
        "Hospital-Inventories": "rgba(149, 125, 205, 1)", // Purple
        "Lab-Inventories": "rgba(255, 167, 38, 1)", // Orange
        "Pharmacy": "rgba(76, 175, 80, 1)", // Green
        "General": "rgba(244, 67, 54, 1)" // Red
    };

    try {
        const inventoryData = await Inventory.aggregate([
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

        // Default labels (Jan to Dec)
        const allLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

        // Determine the latest month with data
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

        res.json({ labels, datasets });
    } catch (error) {
        console.error("Error fetching inventory chart data:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};



exports.createInventory = createInventory
exports.getId = getId
exports.gettingALLInventories = gettingALLInventories
exports.getInventoryById = getInventoryById
exports.UpdateInventoryDetails = UpdateInventoryDetails
exports.updateInventoryStatus = updateInventoryStatus
exports.UpdateInventoryQuantity = UpdateInventoryQuantity
exports.getInvNames = getInvNames
exports.getInventoryByName = getInventoryByName
exports.updateQuantity = updateQuantity
exports.addInventoryFromExcel = addInventoryFromExcel
exports.getChartData=getChartData

