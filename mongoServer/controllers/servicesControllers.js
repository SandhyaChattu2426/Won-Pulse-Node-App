const { response } = require('express')
const rooms = require('../models/rooms')
const Service = require('../models/Services')

//Creating a room
const getServiceByName = async (req, res, next) => {
    const { name } = req.params
    console.log(name, "name @@")
    try {
        Item = await Service.findOne({
            "services.serviceName": name
        })
        console.log(Item)
        res.json({ service: Item })

    } catch (e) {
        console.log(e)
    }
}

const createService = async (req, res, next) => {
    console.log("Creating Service", req.body)
    try {
        const service = new Service({
            ...req.body,

        })

        service.save()
    } catch (e) {
        console.log(e)
    }
    res.json("Serviceregistered Successfully")
}

// Get Room Details (All)
const GetServices = async (req, res, next) => {
    const { hospitalId } = req.params
    console.log(hospitalId, "hospitalId")
    let List;
    try {
        List = await Service.find({ hospitalId: hospitalId })
        console.log(List)
    }
    catch (e) {
        console.log(e)
    }
    res.json({ List })
}

// Getting Id
const getId = async (req, res, next) => {
    const { hospitalId } = req.params
    let newRoomId;
    const str = "0";
    try {
        // Fetch all hospitals from the database
        const room = await Service.find({ hospitalId: hospitalId });
        if (room.length > 0) {
            const lastRoom = await Service.find({ hospitalId }).sort({ _id: -1 }).limit(1);
            console.log(lastRoom, "lastRoom")
            const lastRoomId = lastRoom[0].services.serviceId;
            console.log(lastRoomId, "last@@")
            const lastNumber = parseInt(lastRoomId.substring(2));  // Extracts the number part after 'HP'
            const nextNumber = lastNumber + 1;
            const zerosCount = 6 - nextNumber.toString().length;
            newRoomId = 'SR' + str.repeat(zerosCount) + nextNumber.toString();
        } else {
            newRoomId = 'SR' + '0'.repeat(5) + "1";
        }

        console.log("Generated Hospital ID:", newRoomId);
        res.json({ id: newRoomId });

    } catch (err) {
        console.log(err)
    }
};

//Getting details By Id

const getServicesById = async (req, res, next) => {
    const { Id, hospitalId } = req.params
    console.log(req.params)
    let Item;
    try {
        Item = await Service.findOne({ "services.serviceId": Id, hospitalId: hospitalId })
        // console.log(Item)
        res.json({ service: Item })

    } catch (e) {
        console.log(e)
    }

}
// update Room Status
const updateServiceStatus = async (req, res, next) => {
    try {
        const { id, hospitalId } = req.params
        Item = await Service.findOne({ "services.serviceId": id, hospitalId: hospitalId })

        if (Item) {
            try {
                Item.status = req.body.status
                await Item.save()
                return res.status(200).json({ message: "room status updated successfully!" });

            } catch (e) {
                console.log(e)
                console.log("Could not find the service")
            }
        }
    }
    catch (e) {
        console.log(e)
    }
}

const getReportNames = async (req, res, next) => {
    console.log("Getting report Names")
    try {
        List = await Service.find({ "services.serviceType": "Reports" })
        console.log(List)
        const NameList = List.map(serviceItem => ({

            label: serviceItem.services.serviceName,
            value: serviceItem.services.serviceName,
            id: serviceItem.services.serviceId
        }))
        res.json({ serviceNames: NameList })
    }
    catch (e) {
        console.log(e)
    }

}

const getReportById = async (req, res, next) => {
    console.log(req.params)

    try {
        const report = await Service.find({ "services.serviceId": "SR0001" })
        console.log(report)
    }
    catch (e) {
        console.log(e)
    }
}

const getPharmaNames = async (req, res, next) => {
    console.log("triggering to get Pharmacy Names")
    try {
        List = await Service.find({ "services.serviceType": "Pharmacy" })
        console.log(List)
        const NameList = List.map(serviceItem => ({

            label: serviceItem.services.serviceName,
            value: serviceItem.services.serviceName,
            id: serviceItem.services.serviceId
        }))
        res.json({ PharmaNames: NameList })
    }
    catch (e) {
        console.log(e)
    }

}

const updatePrice = async (req, res, next) => {
    console.log("triggering by god's grace ")
    console.log(req.params, "reqParams")//   { Id: 'SR000012' } reqParams
    console.log(req.body, "body")// { totalPrice: '12' }
    const { Id } = req.params
    const { totalPrice } = req.body
    const item = await Service.findOne({ "services.serviceId": Id })
    console.log(item, "before Update")
    try {
        item.services.totalPrice = totalPrice
        await item.save()
        console.log(item, "after update")
    } catch (e) {
        console.log(e)
    }

    res.json("Price Updated SuccessFully")
}

const getGeneralServicesNames = async (req, res, next) => {
    console.log("Getting General Services Names")
    try {
        List = await Service.find({ "services.serviceType": "GeneralServices" })
        console.log(List)
        const NameList = List.map(serviceItem => ({
            label: serviceItem.services.serviceName,
            value: serviceItem.services.serviceName,
            id: serviceItem.services.serviceId
        }))
        res.json({ serviceNames: NameList })
    }
    catch (e) {
        console.log(e)
    }

}

const getServiceByCategory = async (req, res, next) => {
    const service = await Service.find({ "services.category": "Inventory" })
    res.json({ List: service })
}

const addServiceFromExcel = async (req, res) => {
    function excelDateToJSDate(serialDate) {
        const date = new Date((serialDate - 25569) * 86400 * 1000);
        return date.toISOString().split("T")[0];
    }

    console.log("Incoming Data:", req.body);

    // Destructure relevant fields from req.body (case-sensitive & trimmed)
    const {
        ServiceName,
        Category,
        SubCategory,
        UnitPrice,
        Discount,
        TotalPrice,
        Tax,
        Status,
        hospitalId,
        ReferenceContactNumber,
        ReferenceEmail,
        AddedBy
    } = req.body;
    console.log(hospitalId, "hospitalId")

    if (!ServiceName || !Category || !SubCategory || !UnitPrice || !TotalPrice || !Discount) {
        return res.status(400).json({ message: "Incomplete service details." });
    }

    try {
        // Check if service already exists
        let existingService = await Service.findOne({ "services.serviceName": ServiceName });

        let serviceId;
        if (existingService) {
            // Use existing ID
            serviceId = existingService.services.serviceId;
        } else {
            // Generate new ID
            const totalItems = await Service.countDocuments();
            let lastId;

            if (totalItems > 0) {
                const last = await Service.findOne().sort({ _id: -1 });
                lastId = parseInt(last.services.serviceId?.slice(2) || "0");
            } else {
                lastId = 0;
            }

            const prefix = "SR";
            const newNumber = lastId + 1;
            const paddedNumber = newNumber.toString().padStart(6, "0");
            serviceId = prefix + paddedNumber;
        }

        // Perform upsert operation
        const updatedService = await Service.findOneAndUpdate(
            { "services.serviceName": ServiceName },
            {
                $set: {
                    "services.serviceId": serviceId,
                    "services.serviceName": ServiceName,
                    "services.category": Category,
                    "services.subCategory": SubCategory,
                    "services.tax": Tax,
                    "services.unitPrice": UnitPrice,
                    "services.discount": Discount,
                    "services.totalPrice": TotalPrice,

                    "services.referenceContactNumber": ReferenceContactNumber,
                    "services.referenceEmail": ReferenceEmail,
                    "services.addedBy": AddedBy,

                    hospitalId: hospitalId,
                    status: Status || "Active",
                    createdAt: new Date(),
                    updatedON: new Date()
                }
            },
            { new: true, upsert: true }
        );

        return res.status(200).json({ service: updatedService });
    } catch (err) {
        console.error("Error saving service:", err);
        return res.status(500).json({ message: "Saving service failed. Please try again later." });
    }
};





exports.createService = createService
exports.GetServices = GetServices
exports.getId = getId
exports.getServicesById = getServicesById
exports.updateServiceStatus = updateServiceStatus
exports.getReportNames = getReportNames
exports.getReportById = getReportById
exports.getPharmaNames = getPharmaNames
exports.updatePrice = updatePrice
exports.getGeneralServicesNames = getGeneralServicesNames
exports.getServiceByName = getServiceByName
exports.getServiceByCategory = getServiceByCategory
exports.addServiceFromExcel = addServiceFromExcel