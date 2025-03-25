const  Roles=require('../models/roles')


const AddRole = async (req, res, next) => {
    // const { supplierDetails, adress } = req.body
    try {
        const newRole = new Roles({
            ...req.body,
        })
        await newRole.save()
    }
    catch (e) {
        console.log(e)
    }
    res.json("Report Registered Sucessfully")
}

// GETTing Details

const GetRoles = async (req, res, next) => {
    console.log("triggering @@")
    const {hospitalId}=req.params
    
    let List;
    try {
        List = await Roles.find({hospitalId:hospitalId})
        // console.log(List,"List")
    }
    catch (e) {
        console.log(e)
    }
    res.json({ List })
}

// GetId
const getId = async (req, res, next) => {
    const {hospitalId}=req.params
    const str = "0";
    try {
        const DbRoles = await Roles.find({hospitalId});

        if (DbRoles.length > 0) {
            const lastRoom = await Roles.find({hospitalId}).sort({ _id: -1 }).limit(1);
            const lastRoomId = lastRoom[0].roleId;
            const lastNumber = parseInt(lastRoomId.substring(2));  
            const nextNumber = lastNumber + 1;
            const zerosCount = 6 - nextNumber.toString().length;
            newRoomId = 'R' + str.repeat(zerosCount) + nextNumber.toString();
        } else {
            newRoomId = 'R' + '0'.repeat(5) + "1";  
        }

        // console.log("Generated Hospital ID:", newRoomId);
        res.json({ id: newRoomId });
    } catch (err) {
        console.log(err)

    }
};

const GetRoleById=async(req,res,next)=>{
    console.log(req.params)
}

const GetRoleByName=async(req,res,next)=>{
    // console.log(req.params)
    const {role}=req.params
    const roleDetails=await Roles.findOne({roleName:role})
    console.log(roleDetails.permissions)
    res.json({permissions:roleDetails.permissions})
}


exports.AddRole=AddRole
exports.GetRoles=GetRoles
exports.getId=getId
exports.GetRoleById=GetRoleById
exports.GetRoleByName=GetRoleByName