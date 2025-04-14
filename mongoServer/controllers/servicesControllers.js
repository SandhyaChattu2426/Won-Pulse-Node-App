const { response } = require('express')
const rooms = require('../models/rooms')
const Service = require('../models/Services')

//Creating a room
const getServiceByName = async (req, res, next) => {
    const { name } = req.params
    console.log(name,"name @@")
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
    const {hospitalId} = req.params
    console.log(hospitalId,"hospitalId")    
    let List;
    try {
        List = await Service.find({hospitalId : hospitalId})
        console.log(List)
    }
    catch (e) {
        console.log(e)
    }
    res.json({ List })
}

// Getting Id
const getId = async (req, res, next) => {
    const {hospitalId}=req.params
    let newRoomId;
    const str = "0";
    try {
        // Fetch all hospitals from the database
        const room = await Service.find({hospitalId:hospitalId});
        if (room.length > 0) {
            const lastRoom = await Service.find({hospitalId}).sort({ _id: -1 }).limit(1);
            console.log(lastRoom,"lastRoom")
            const lastRoomId = lastRoom[0].services.serviceId;
            console.log(lastRoomId,"last@@")
            const lastNumber = parseInt(lastRoomId.substring(2));  // Extracts the number part after 'HP'
            const nextNumber = lastNumber + 1;
            const zerosCount = 6 - nextNumber.toString().length;
            newRoomId = 'SR' + str.repeat(zerosCount) + nextNumber.toString();
        } else {
            newRoomId = 'SR' + '0'.repeat(5) + "1";  // HP000001
        }

        console.log("Generated Hospital ID:", newRoomId);
        res.json({ id: newRoomId });

    } catch (err) {
        console.log(err)
    }
};

//Getting details By Id

const getServicesById = async (req, res, next) => {
    const { Id } = req.params

    console.log("getServiceById is triggering")
    let Item;
    try {
        Item = await Service.findOne({ "services.serviceId": Id })
        console.log(Item)
        res.json({ service: Item })

    } catch (e) {
        console.log(e)
    }

}
// update Room Status
const updateServiceStatus = async (req, res, next) => {
    try {

        const Id = req.params.Id
        // console.log(StaffId,"here is")
        Item = await Service.findOne({ "services.serviceId": Id })

        if (Item) {
            try {
                Item.status = req.body.status
                await Item.save()
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

// Conditionally renders

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
    // console.log("Triggering @mongoose")
    // console.log(req.params,"parame")
    const service = await Service.find({ "services.category": "Inventory" })
    // console.log(service,"services")
    res.json({ List: service })
}

const addServiceFromExcel = async (req, res, next) => {
    function excelDateToJSDate(serialDate) {
        const date = new Date((serialDate - 25569) * 86400 * 1000);
        return date.toISOString().split("T")[0];
    }

    //    let {}
    console.log(req.body);

    let { servicename, category, subcategory, unitprice, discount, totalprice, status, tax } = req.body
    if (!servicename || !category || !subcategory || !unitprice || !totalprice || !discount) {
        return res.status(400).send({ message: "Incomplete Service  details." });
    }

    try {
        // Check if a patient with the provided email exists
        let serviceName = await Service.findOne({ "services.serviceName": servicename });
        console.log(serviceName, "obj")

        let serviceId;
        if (serviceName) {
            // Use the existing patientId if found
            serviceId = serviceName.services.serviceId;
        } else {
            // Generate a new patient ID if not found
            const totalItems = await Service.countDocuments();
            let lastId;

            if (totalItems > 0) {
                const last = await Service.findOne().sort({ _id: -1 });
                console.log(last, "lastItem")
                lastId = parseInt(last.services.serviceId.slice(2));
            } else {
                lastId = 0;
            }

            const prefix = "SR";
            const newNumber = lastId + 1;
            const paddedNumber = newNumber.toString().padStart(6, "0");
            serviceId = prefix + paddedNumber;
        }

        // Create or update the patient record
        console.log(serviceId, "Id here")
        const updatedService = await Service.findOneAndUpdate(
            { "services.serviceName": servicename },
            {
                $set: {
                    services: {
                        serviceId: serviceId,
                        serviceName: servicename,
                        category: category,
                        subCategory: subcategory,
                        tax: tax,
                        unitPrice: unitprice,
                        discount: discount,
                        totalPrice: totalprice
                    },
                    status: status || "Active"
                }
            },
            { new: true, upsert: true } // Return updated document; create if not exists
        );

        res.status(200).json({ service: updatedService });
    } catch (err) {
        // return next(new HttpError(`Saving patient failed, please try again. ${err}`, 500));
        console.log(err, "error")
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