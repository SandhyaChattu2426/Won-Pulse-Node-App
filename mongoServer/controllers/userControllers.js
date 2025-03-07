const { response } = require('express')
const rooms = require('../models/rooms')
const User = require('../models/Users')
const { validationResult } = require('express-validator')
const bcrypt = require('bcrypt');

//Creating a room
const getServiceByName=async(req,res,next)=>{
    const {serviceName}=req.params
    try {
        Item = await Service.findOne({ "services.serviceName": serviceName
         })
        console.log(Item)
        res.json({service:Item})

    } catch (e) {
        console.log(e)
    }
}

const createService = async (req, res, next) => {
    console.log("Creating Service",req.body)
    try {
        // here i want to check whether serviceName is already existed in the database or not ,
        // so I want to call the function getServiceByName,if the response is getted , i dont want to save
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
    console.log("triggeing GET service")
    let List;
    try {
        List = await Service.find({})
    }
    catch (e) {
        console.log(e)
    }
    res.json({ List })
}

// Getting Id
const getId = async (req, res, next) => {
    let newRoomId;
    let RoomsLength;
    const str = "0";
    
    console.log("Backend triggering to get ID");

    try {
        // Fetch all hospitals from the database
        const room = await Service.find({});

        if (room.length > 0) {
            // Get the last hospital document, sorted by _id in descending order
            const lastRoom = await Service.find({}).sort({ _id: -1 }).limit(1);

            // Extract the last hospital's hospitalId
            const lastRoomId = lastRoom[0].services.serviceId;
            
            // Calculate the next hospitalId based on the last one
            // Extract the numeric part of the last hospitalId (assuming the format is HP000001)
            const lastNumber = parseInt(lastRoomId.substring(2));  // Extracts the number part after 'HP'

            // Generate the next hospitalId (increment the last number)
            const nextNumber = lastNumber + 1;

            // Determine the number of leading zeros required for the new ID
            const zerosCount = 6 - nextNumber.toString().length;
            newRoomId = 'SR' + str.repeat(zerosCount) + nextNumber.toString();
        } else {
            // If no hospitals exist, create the first hospitalId
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
        res.json({service:Item})

    } catch (e) {
        console.log(e)
    }
    
}
// update Password
const updatePassword = async (req, res, next) => {
    console.log("Triggering Password Update")
    console.log(req.params)
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
         res.status(422)
        return next(new HttpError('Invalid inputs passed, please check your data'))
    }

    const { password
    } = req.body
    const email = req.params.email
    let login
    try {
        login = await User.find({ email: email })
        // console.log(login)

    }
    catch (err) {
        const error = new HttpError(`Something went wrong, could not update login.${err}`, 500)
        return next(error)
    }
    login = login[0]

    const hashPassword = async (plainTextPassword) => {
        const saltRounds = 10;
        try {
            const hashedPassword = await bcrypt.hash(plainTextPassword, saltRounds);
            return hashedPassword;
        } catch (err) {
            throw new Error('Error hashing password');
        }
    };

    const hashedPassword = await hashPassword(password);

    login.password = hashedPassword

    try {
        await login.save()
    }
    catch (err) {
        const error = new HttpError(`Something went wrong, could not update login.${err}`, 500)
        return next(error)
    }

    // DUMMY[placeIndex] = updatedPlace

    res.status(200).json({ login: login })
}

// Conditionally renders

const getReportNames=async (req,res,next)=>{
    console.log("Getting report Names")
    try{
    List = await Service.find({"services.serviceType":"Reports"})
    console.log(List)
    const NameList=List.map(serviceItem=>({
       
        label:serviceItem.services.serviceName,
        value:serviceItem.services.serviceName,
        id:serviceItem.services.serviceId
    }))
    res.json({serviceNames:NameList})
    }
    catch(e){
        console.log(e)
    }

}

const getReportById=async (req,res,next)=>{
    console.log(req.params)
  
    try{
        const report=await Service.find({"services.serviceId":"SR0001"})
        console.log(report)
    }
    catch(e){
        console.log(e)
    }
}



const updatePrice=async(req,res,next)=>{
    console.log("triggering by god's grace ")
    console.log(req.params,"reqParams")//   { Id: 'SR000012' } reqParams
    console.log(req.body,"body")// { totalPrice: '12' }
    const {Id}=req.params
    const {totalPrice}=req.body
    const item=await Service.findOne({"services.serviceId": Id})
    console.log(item,"before Update")
    try{
     item.services.totalPrice=totalPrice
    await item.save()
    console.log(item,"after update")
    }catch(e){
        console.log(e)
    }

 res.json("Price Updated SuccessFully")
}





const updateMfa = async (req, res, next) => {
    console.log("triggering @mfa");
    const { email } = req.params;
    let { is_mfa_enabled, mfa_type, passkey } = req.body;
    console.log("Received mfa_type:", mfa_type); // Debugging log

    try {
        const user = await User.findOne({ email });

        if (user) {
            // Ensure mfa_type is stored as an array
            if (mfa_type) {
                // Convert to an array if it's a string
                if (!Array.isArray(mfa_type)) {
                    mfa_type = [mfa_type];
                }
                user.mfa_type = [...new Set([...(user.mfa_type || []), ...mfa_type])];
            }

            if (is_mfa_enabled) {
                user.is_mfa_enabled = is_mfa_enabled;
            }

            if (passkey) {
                user.passkey = passkey;
            }

            await user.save();

            return res.status(200).json({ message: "MFA settings updated successfully", user });
        } else {
            return res.status(404).json({ message: "User not found" });
        }
    } catch (error) {
        console.error("Error occurred while updating MFA:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

const getUserByEmail = async (req, res, next) => {
    try {
        const { email } = req.params;
        
        if (!email) {
            return res.status(400).json({ success: false, message: "Email is required" });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        return res.status(200).json({ success: true, user });
    } catch (error) {
        console.error("Error fetching user:", error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};






exports.createService=createService
exports.GetServices=GetServices
exports.getId=getId
exports.getServicesById=getServicesById
exports.updatePassword=updatePassword
exports.getReportNames=getReportNames
exports.getReportById=getReportById
exports.updatePrice=updatePrice
exports.getServiceByName=getServiceByName
exports.updateMfa=updateMfa
exports.getUserByEmail=getUserByEmail