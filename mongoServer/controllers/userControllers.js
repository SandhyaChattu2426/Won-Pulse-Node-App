const { response } = require('express')
const User = require('../models/Users')
const { validationResult } = require('express-validator')
const bcrypt = require('bcrypt');
const staff = require('../models/staff');
const users=require('../models/Users')


const updateMfa = async (req, res, next) => {
    // console.log("triggering @mfa");
    const { email } = req.params;
    let { is_mfa_enabled, mfa_type, passkey } = req.body;
    // console.log("Received mfa_type:", mfa_type);

    try {
        let entityType = "user";
        let entity = await User.findOne({ email });

        if (!entity) {
            entity = await staff.findOne({ email });
            entityType = "staff";
        }

        if (entity) {
            if (mfa_type) {
                // if (!Array.isArray(mfa_type)) {
                //     mfa_type = [mfa_type]; // Convert to an array if it's a string
                // }
                entity.mfa_type = [...new Set([...(entity.mfa_type || []), mfa_type])];
            }

            // if (is_mfa_enabled !== undefined) {
            entity.is_mfa_enabled = true;
            // }

            if (passkey) {
                entity.passkey = passkey;
            }

            await entity.save();

            return res.status(200).json({
                message: "MFA settings updated successfully",
                [entityType]: entity
            });
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
        // only for saturday
        const staffOne = await staff.findOne({ email });
        // console.log(staffOne)
        if (user) {
            return res.status(200).json({ success: true, user });
            // return res.status(404).json({ success: false, message: "User not found" });
        }
        if (staff) {
            return res.status(200).json({ success: true, staffOne });
        }
        else {
            return res.status(200).json({ msg: "User NotFound" });

        }


    } catch (error) {
        console.error("Error fetching user:", error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

// Updated For Layouts

const getLogin = async (req, res, next) => {
}

const getLoginById = async (req, res, next) => {
        const email = req.params.sid;
        let login
        try {
            login = await users.find({ email: email })
            // console.log(login,"login")
    
        } catch (err) {
            const error = new HttpError(`Something went wrong, could not find a login.${err}`, 500)
            return next(error)
        }
    
        // const place = DUMMY.find((p) => {
        //     return p.id === placeId;
        // })
    
        if (!login) {
            throw new HttpError('Could not find a login for the provided id.', 404)
            return next(error)
            // error.code = 404
            // throw error
            // return res.status(404).json({ message: 'Could not find a place for the provided id.' })
        }
    
        // console.log("GET Request in Places", institute);
        res.json({ login: login })
    }
    
    


const putId = async (req, res, next) => {
}

const createLogin = async (req, res, next) => {
}

const updateLayout = async (req, res, next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        // res.status(422)
        return next(new HttpError('Invalid inputs passed, please check your data'))
    }

    const { dashboard_layouts
    } = req.body
    // console.log(dashboard_layouts,"layouts")
    const email = req.params.sid

    let login
    try {
        await User.findOneAndUpdate(
            { email: email }, 
            { $set: { dashboard_layouts: dashboard_layouts } },
            { new: true, useFindAndModify: false }
          );

    }
    catch (err) {
        // const error = new HttpError(`Something went wrong, could not update login.${err}`, 500)
        // return next(error)
        console.log(err)
    }



    // try {
    //     await login.save()
    // }
    // catch (err) {
    //     // const error = new HttpError(`Something went wrong, could not update login.${err}`, 500)
    //     console.log(err,"error")
    //     // return next(error)
    // }

    // DUMMY[placeIndex] = updatedPlace

    res.status(200).json({ login: login })

}

const updateLogin = async (req, res, next) => {
}

const updatePassword = async (req, res, next) => {
}

const searchLogin = async (req, res, next) => {
}

const deleteLogin = async (req, res, next) => {
}







exports.updateMfa = updateMfa
exports.getUserByEmail = getUserByEmail
exports.getLogin = getLogin
exports.getLoginById = getLoginById
exports.putId = putId;
exports.createLogin = createLogin;
exports.updatePassword = updatePassword;
exports.updateLayout = updateLayout
exports.updateLogin = updateLogin
exports.searchLogin = searchLogin
exports.deleteLogin=deleteLogin

