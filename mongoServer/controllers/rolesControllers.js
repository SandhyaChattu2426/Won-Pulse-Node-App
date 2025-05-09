const  Roles=require('../models/roles')
const Staff=require('../models/staff')

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

const GetRoles = async (req, res, next) => {
    const {hospitalId}=req.params
    let List;
    try {
        List = await Roles.find({hospitalId:hospitalId})
        console.log(List,"List")
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
    try{
        const role=await Roles.findOne({roleId:req.params.roleId,hospitalId:req.params.hospitalId})
        console.log(role)
        res.json({role})
    }catch(e){
        console.log(e)
    }
}

const GetRoleByName=async(req,res,next)=>{
    // console.log(req.params)
    const {role}=req.params
    const roleDetails=await Roles.findOne({roleName:role})
    if(roleDetails){
    console.log(roleDetails.permissions)
    res.json({permissions:roleDetails.permissions})
    }else{
        console.log("error Getting in Role")
    }
}

const UpdateRoleCount=async(req,res,next)=>{
    const {role}=req.params
    try{
        const roleDetails=await Roles.findOne({roleName:role})
        roleDetails.count=roleDetails.count+1
       await roleDetails.save()
    }
    catch(e){
        console.log(e,"error")
    }
}

const GetRoleCount = async (req, res, next) => {
    try {
        // console.log(req.params); // { roleName: 'Doctor', hospitalId: 'HP000001' }

        const { roleName, hospitalId } = req.params;

        // Count the number of staff with the given role in the specified hospital
        const roleCount = await Staff.countDocuments({ hospitalId, jobRole: roleName });

        return res.status(200).json({ count: roleCount });
    } catch (e) {
        console.error(e, "error");
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

const UpdateRole=async(req,res,next)=>{
    const {roleId,hospitalId}=req.params
    console.log(req.body)
    const {roleName,description,permissions}=req.body
    try{
    const role=await Roles.findOne({roleId:roleId,hospitalId:hospitalId})
    role.roleName=roleName
    role.description=description
    role.permissions=permissions
    await role.save()
    res.json("Updated Role")
        
    }catch(e){
        console.log(e,"error")
    }
}

exports.AddRole=AddRole
exports.GetRoles=GetRoles
exports.getId=getId
exports.GetRoleById=GetRoleById
exports.GetRoleByName=GetRoleByName
exports.UpdateRoleCount=UpdateRoleCount
exports.GetRoleCount=GetRoleCount
exports.UpdateRole=UpdateRole