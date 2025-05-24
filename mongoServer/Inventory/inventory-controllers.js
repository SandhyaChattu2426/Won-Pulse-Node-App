const HttpError = require('../models/http-error')
const Inventory = require('./inventory')
const Staff = require('../controllers/staff-controllers')
const path = require('path')
const fs = require("fs");
const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

const LowStockAlert = async (appointment) => {
    const { appointmentId, fullName, hospitalId, appointmentDate, doctorName,
        patientId, reason, staffId, appointmentTime } = appointment;

    const emailTemplatePath = path.join(
        __dirname,
        "..",
        "EmailTemplates",
        "lowStockAlert.html"
    );

    let emailTemplate = fs.readFileSync(emailTemplatePath, "utf-8");

    const inventoryStaffList = await Staff.getStaffByRoleNameForBackend(hospitalId, "Inventory Manager");
    console.log(inventoryStaffList, "Inventory Staff");

    // Loop through all staff and send email to each
    for (const staff of inventoryStaffList) {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: staff.email, // assuming each object has `email` field
            subject: "WONPULSE: Low Stock Alert",
            html: emailTemplate,
        };

        try {
            await transporter.sendMail(mailOptions);
            console.log(`Email sent to ${staff.email}`);
        } catch (error) {
            console.error(`Failed to send email to ${staff.email}`, error);
        }
    }

    return { success: true, message: "Emails sent to all Inventory Managers." };
};


//CREATE INVENTORY
const createInventory = async (req, res, next) => {
    const newInventory = new Inventory({
        ...req.body
    })
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
    const str = "0";
    const { hospitalId } = req.params;

    try {
        const inventoryItems = await Inventory.find({ hospitalId });

        if (inventoryItems.length > 0) {
            const lastInventoryItem = await Inventory.find({ hospitalId }).sort({ _id: -1 }).limit(1);

            if (lastInventoryItem.length > 0) {
                const lastInventoryId = lastInventoryItem[0].inventoryId;
                const lastNumber = parseInt(lastInventoryId.substring(2)); // Assuming format: IN000001
                const nextNumber = lastNumber + 1;
                const zerosCount = 6 - nextNumber.toString().length;
                newInventoryId = 'IN' + str.repeat(zerosCount) + nextNumber.toString();
            }
        } else {
            // If no inventory exists for this hospital, start with IN000001
            newInventoryId = 'IN' + '0'.repeat(5) + "1";
        }

        // console.log("Generated Inventory ID:", newInventoryId);
        res.json({ id: newInventoryId });
    } catch (err) {
        console.error("Error generating inventory ID:", err);
        return next(new HttpError("Couldn't fetch the inventory details", 500));
    }
};

const gettingALLInventories = async (req, res, next) => {
    const { hospitalId } = req.params
    let InventoryList
    try {
        InventoryList = await Inventory.find({ hospitalId: hospitalId })
    }
    catch (e) {
        console.log(e)
    }
    res.json({ InventoryList })
}

//Get Inventory By Id

const getInventoryById = async (req, res, next) => {
    const { Id } = req.params
    console.log(Id, "here")
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
    // console.log(req.params)
    let Item;
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


    try {
        const { id, hospitalId } = req.params
        console.log(id, hospitalId)
        const { status } = req.body
        const room = await Inventory.findOne({ inventoryId: id, hospitalId: hospitalId })
        console.log(room, "BeforeUpdate")
        if (room) {
            try {
                room.status = status
                await room.save()
                console.log(room, "AfterUpdate")
                return res.status(200).json({ message: "inventory status updated successfully!" });

            } catch (e) {
                console.log(e)
            }
        }
    }
    catch (e) {
        console.log(e)
    }
}

// Update InventoryQuantity accepting List

const UpdateInventoryQuantity = async (req, res, next) => {
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
}

const addInventoryFromExcel = async (req, res, next) => {
    let last, lastId, newId;
    let createdItem;

    function excelDateToJSDate(serialDate) {
        if (!serialDate || isNaN(serialDate)) return null;
        const jsDate = new Date((serialDate - 25569) * 86400 * 1000);
        if (isNaN(jsDate.getTime())) return null;
        return jsDate.toISOString().split("T")[0];
    }
    try {
        const totalItems = await Inventory.countDocuments();
        if (totalItems > 0) {
            last = await Inventory.findOne().sort({ _id: -1 });
            lastId = parseInt(last.inventoryId.slice(2));
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

    const body = req.body;
    // console.log(body, "Incoming data from Excel");

    createdItem = new Inventory({
        inventoryId: newId,
        category: body.Category,
        serviceName: body.ServiceName,
        quantity: Number(body.Quantity),
        units: Number(body.Units),
        quantityInStock: Number(body.QuantityInStock) || 0,
        receivedDate: excelDateToJSDate(body.ReceivedDate),
        manufactureDate: excelDateToJSDate(body.ManufactureDate),
        expairyDate: excelDateToJSDate(body.ExpairyDate),
        minimumLevel: Number(body.MinimumLevel),
        reorderLevel: Number(body.ReorderLevel),
        storageLocation: body.StorageLocation,
        criticalityLevel: Number(body.CriticalityLevel),
        temperature: Number(body.Temperature),
        supplierName: body.SupplierName,
        contactNumber: body.ContactNumber,
        email: body.Email,
        status: body.Status || "Active",
        hospitalId: body.hospitalId || "",
        staffId: body.StaffId || ""
    });

    // Basic validation
    if (
        !body.ServiceName ||
        !body.Quantity ||
        !body.Units ||
        !body.Category ||
        !body.MinimumLevel ||
        !body.Status
    ) {
        return res.status(400).send({ message: "Incomplete Inventory details." });
    }

    try {
        if (!createdItem.receivedDate) {
            const today = new Date();
            createdItem.receivedDate = today.toISOString().split("T")[0];
        }

        await createdItem.save();
        res.status(201).json({ item: createdItem });
    } catch (err) {
        return next(new HttpError(`Creating item failed, Please try again. ${err}`, 500));
    }
};

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

const getInventoryByIdForBackend = async (inventoryId, netChange, hospitalId) => {

    try {
        const inventoryItem = await Inventory.findOne({ inventoryId, hospitalId });
        if (!inventoryItem) {
            throw new Error(`Inventory item not found for ID: ${inventoryId}`);
        }

        // Correct logic: subtract if positive (consume), add if negative (return)
        inventoryItem.quantity = inventoryItem.quantity - netChange;

        // Optional safety: prevent going negative
        if (inventoryItem.quantity < 0) {
            throw new Error(`Inventory for ${inventoryId} would go negative!`);
        }

        await inventoryItem.save();
        return true;
    } catch (error) {
        console.error("Error updating inventory item:", error.message);
        throw error;
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
exports.getChartData = getChartData
exports.getInventoryByIdForBackend = getInventoryByIdForBackend

