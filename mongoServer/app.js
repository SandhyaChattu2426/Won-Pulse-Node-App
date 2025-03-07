const express = require("express")
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const Hospitals = require('./models/hospitals')
const app = express()
const cors = require("cors");
const bodyParser = require('body-parser')
const patientsRoutes = require('./routes/patients-routes')
const HttpError = require("./models/http-error")
const mongoose = require("mongoose")
const StaffRoutes = require('./routes/staff-routes')
const AppointmentRoutes = require('./routes/appointment-routes')
const InventoryRoutes = require('./Inventory/inventory-routes')
const supplierRoutes = require('./suppliers/supplierRoutes')
const pharmacyRoutes = require('./pharmacy/pharmacy-routes')
const AdmissionRoutes = require('./routes/AdmissionRoutes')
const HospitalRoutes = require('./routes/hospitalRoutes')
const RoomRoutes = require('./routes/roomsRoutes')
const ReportRoutes = require('./routes/reportsRoutes')
const ServiceRoutes = require('./routes/servicesRoutes')
const UserRoutes = require('./routes/userRoutes')
const PharmaBillRoutes = require('./routes/pharmaBillRoutes')
const BillRoutes = require('./routes/billRoutes')
const Login = require('./models/Users');
const staff = require("./models/staff");
require('dotenv').config();
const secretKey = process.env.JWT_SECRET;
const secretRefreshKey = process.env.JWT_REFRESH_SECRET;
app.use(bodyParser.json())

// app.use((req, res, next) => {
//     res.setHeader('Access-Control-Allow-Origin', '*')
//     res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization')
//     res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE')

//     // Handle OPTIONS preflight request
//     if (req.method === 'OPTIONS') {
//         return res.status(200).end(); // Respond with 200 OK for OPTIONS request (preflight)
//     }

//     next(); // Continue to the next middleware/route handler
// })

app.use(cors());


app.use('/api/patient', patientsRoutes);
app.use('/api/staff', StaffRoutes)
app.use('/api/appointments', AppointmentRoutes)
app.use('/api/inventory', InventoryRoutes)
app.use('/api/supplier', supplierRoutes)
app.use('/api/pharmacy', pharmacyRoutes)
app.use('/api/admission', AdmissionRoutes)
app.use('/api/hospital', HospitalRoutes)
app.use('/api/room', RoomRoutes)
app.use('/api/reports', ReportRoutes)
app.use('/api/service', ServiceRoutes)
app.use('/api/user', UserRoutes)
app.use('/api/medicinebill', PharmaBillRoutes)
app.use('/api/genralbill', BillRoutes)



// app.use('/api/users', usersRoutes)
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

const otpStorage = {}; // Store OTPs temporarily

// Generate a random 6-digit OTP for user verification while sign up
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

const sendOTP = async (email, otp) => {
    console.log(otp,"triffering")
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'WONPULSE: Your One-Time Password (OTP)',
        html: `
            <div style="background-color: #f4f4f4; padding: 20px; text-align: center; font-family: Arial, sans-serif;">
                <div style="max-width: 400px; margin: auto; background: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
                    <h2 style="color: #333;">WONDigi: OTP Verification</h2>
                    <p style="color: #555; font-size: 16px;">Use the following OTP to complete your verification:</p>
                    <div style="font-size: 24px; font-weight: bold; color: #007bff; padding: 10px 20px; background: #e0f2ff; display: inline-block; border-radius: 5px;">
                        ${otp}
                    </div>
                    <p style="color: #888; font-size: 14px; margin-top: 20px;">This OTP is valid for only 10 minutes. Do not share it with anyone.</p>
                </div>
            </div>
        `,
    };

    return transporter.sendMail(mailOptions);
};

app.post('/send-email-otp-forPassword', async (req, res) => {
    const { email } = req.body;
    console.log('Received email:', email);

    // Check if the email already exists in the database
    try {
        const user = await Login.findOne({ email: email }); // MongoDB query using Mongoose
        console.log(user)
        // If a user with this email exists, return an error response
        if (user) {
            const otp = generateOTP();
            console.log(otp) // Assume generateOTP() generates a random OTP
            otpStorage[email] = { otp, expiry: Date.now() + 120000 };  // Store OTP with an expiry of 2 minutes

            // Send OTP to the email (assume sendOTP handles email delivery)
            await sendOTP(email, otp);

            console.log('Email OTP sent successfully.');
            // Return success response if OTP is sent successfully
            console.log(otpStorage)
            res.status(200).json({ message: 'OTP sent successfully!' });

        }
        else {
            return res.status(400).json({ message: 'User does not Exist' });

        }

    } catch (error) {
        console.log('Error checking email or sending OTP:', error);
        res.status(500).json({ error, message: 'Internal Server Error.' });
    }
});

app.post('/send-email-otp', async (req, res) => {
    const { email } = req.body;
    console.log(email)

    // Check if the email already exists in the database
    try {
        const user = await Login.findOne({ email: email }); // MongoDB query using Mongoose

        // If a user with this email exists, return an error response
        if (!user) {
            const otp = generateOTP(); // Assume generateOTP() generates a random OTP
            otpStorage[email] = { otp, expiry: Date.now() + 120000 };  // Store OTP with an expiry of 2 minutes
            console.log(otp)
            // Send OTP to the email (assume sendOTP handles email delivery)
            await sendOTP(email, otp);
            res.status(200).json({ message: 'OTP sent successfully!' });
        }
        else {
            return res.status(400).json({ message: 'User does not Exist' });

        }

    } catch (error) {
        console.log('Error checking email or sending OTP:', error);
        res.status(500).json({ error, message: 'Internal Server Error.' });
    }
});

app.post('/send-hospital-email-otp', async (req, res) => {
    const { email } = req.body;

    try {
        const user = await Hospitals.findOne({ "contactInformation.email": email }); // MongoDB query using Mongoose

        // If a user with this email exists, return an error response
        if (user) {
            const otp = generateOTP(); // Assume generateOTP() generates a random OTP
            otpStorage[email] = { otp, expiry: Date.now() + 120000 };  // Store OTP with an expiry of 2 minutes

            console.log(otp);

            // Send OTP to the email (assume sendOTP handles email delivery)
            await sendOTP(email, otp);
            res.status(200).json({ message: 'OTP sent successfully!' });
        }
        else {
            return res.status(400).json({ message: 'User does not Exist' });

        }

    } catch (error) {
        console.log('Error checking email or sending OTP:', error);
        res.status(500).json({ error, message: 'Internal Server Error.' });
    }
});
app.post('/send-staff-email-otp', async (req, res) => {
    const { email } = req.body;

    try {
        const user = await staff.findOne({ "email": email }); // MongoDB query using Mongoose

        // If a user with this email exists, return an error response
        if (user) {
            const otp = generateOTP(); // Assume generateOTP() generates a random OTP
            otpStorage[email] = { otp, expiry: Date.now() + 120000 };  // Store OTP with an expiry of 2 minutes

            console.log(otp);

            // Send OTP to the email (assume sendOTP handles email delivery)
            await sendOTP(email, otp);
            res.status(200).json({ message: 'OTP sent successfully!' });
        }
        else {
            return res.status(400).json({ message: 'User does not Exist' });

        }

    } catch (error) {
        console.log('Error checking email or sending OTP:', error);
        res.status(500).json({ error, message: 'Internal Server Error.' });
    }
});

const sendOTPStaff = async (email, Id) => {
    console.log("triggering SendOtPHospital")
    console.log(email, "email")
    console.log(Id, "Id")
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'WONPULSE: Complete Your Registration Process',
        html: `
            <a href=http://localhost:5173/hospital/${Id}
               style="color: #007bff; text-decoration: none; font-weight: bold;">
                Click the link  to complete your registration Process
            </a>
        `,
    };
    return transporter.sendMail(mailOptions);
};

app.post('/EmailStaff', async (req, res) => {
    console.log("Triggering @staff ")
    console.log(req.body)
    const { email, Id } = req.body;
    console.log('Received email:', email);

    // Check if the email already exists in the database
    try {
        // const user = await Hospitals.findOne({ "contactInformation.email": email }); 
        // console.log(user)// MongoDB query using Mongoose

        // if (user) {

        await sendOTPStaff(email, Id);

        res.status(200).json({ message: 'OTP sent successfully!' });


        // else {
        //     return res.status(400).json({ message: 'Hospital does not exist' });

        // }

    } catch (error) {
        console.log('Error checking email or sending OTP:', error);
        res.status(500).json({ error, message: 'Internal Server Error.' });
    }
});
// FUnction to send email after registering the hospital by sandhya
app.post('/EmailHospital', async (req, res) => {
    console.log("Triggering")
    console.log(req.body)
    const { email, Id } = req.body;
    console.log('Received email:', email);

    // Check if the email already exists in the database
    try {
        // const user = await Hospitals.findOne({ "contactInformation.email": email }); 
        // console.log(user)// MongoDB query using Mongoose

        // if (user) {

        await sendOTPHospital(email, Id);

        res.status(200).json({ message: 'OTP sent successfully!' });


        // else {
        //     return res.status(400).json({ message: 'Hospital does not exist' });

        // }

    } catch (error) {
        console.log('Error checking email or sending OTP:', error);
        res.status(500).json({ error, message: 'Internal Server Error.' });
    }
});
const sendOTPHospital = async (email, Id) => {
    console.log("triggering SendOtPHospital")
    console.log(email, "email")
    console.log(Id, "Id")
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'WONPULSE: Complete Your Registration Process',
        html: `
            <a href=http://localhost:5173/hospital/${Id}
               style="color: #007bff; text-decoration: none; font-weight: bold;">
                Click the link  to complete your registration Process
            </a>
        `,
    };
    return transporter.sendMail(mailOptions);
};

// FUNCTION TO VERIFY THE OTP
const verifyOtp = (email, otp) => {
    const storedOtpData = otpStorage[email];
    console.log(storedOtpData.otp, "*****")

    try {
        if (!storedOtpData) {
            return { status: 400, message: 'OTP not found for this email.' };
        }

        // Check if the OTP has expired
        if (Date.now() > storedOtpData.expiry) {
            return { status: 400, message: 'OTP expired.' };
        }

        // Verify the OTP
        if (storedOtpData.otp === otp) {
            console.log("ok,working")
            return { status: 200, message: 'OTP verified successfully!' };
        } else {
            return { status: 400, message: 'Invalid OTP.' };
        }
    } catch (error) {
        console.error('Error verifying OTP:', error);
        return { status: 500, message: 'Internal server error.' };
    }
};

// API FOR VERIFYING OTP WHEN CREATING A NEW USER
app.post('/verify-otp', (req, res) => {
    const { email, otp } = req.body;
    const result = verifyOtp(email, otp);
    return res.status(result.status).json({ message: result.message });
});

//login otp verification
app.post('/verify-login-otp', (req, res) => {
    const { email, otp } = req.body;
    console.log(email, otp)

    const result = verifyOtp(email, otp);
    console.log(result)

    return res.status(result.status).json({ message: result.message });
})


// Register Login
app.post('/register-login', async (req, res) => {
    const { email, password, fullName, contact } = req.body;
    if (!email || !password || !fullName) {
        return res.status(400).json({ success: false, message: 'Email, password, and user name are required.' });
    }

    const hashPassword = async (plainTextPassword) => {
        const saltRounds = 10;
        try {
            const hashedPassword = await bcrypt.hash(plainTextPassword, saltRounds);
            return hashedPassword;
        } catch (err) {
            throw new Error('Error hashing password');
        }
    };


    try {
        const existingUser = await Login.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ success: false, message: 'Email is already registered.' });
        }

        const hashedPassword = await hashPassword(password);

        const companyDetails = req.body.company_details || null;

        const newLogin = new Login({
            user_id: req.body.user_id || null,
            user_name: req.body.user_name || null,
            role_id: req.body.role_id || null,
            first_name: req.body.fullName || null,
            last_name: req.body.lastName || null,
            title: req.body.schoolName || null,
            user_status: req.body.user_status || 'active',
            selected_layout: req.body.selected_layout || 'default',
            dashboard_layouts: req.body.dashlay || null,
            password: hashedPassword,
            login_key: req.body.login_key || null,
            reset_password: req.body.reset_password || null,
            email: req.body.email || null,
            time_zone: req.body.time_zone || 'Asia/Kolkata',
            contact: req.body.contact || null,
            location: req.body.location || null,
            user_type: req.body.user_type || 'standard',
            email_otp: req.body.email_otp || null,
            phone_otp: req.body.contact || null,
            company_details: companyDetails,
            is_mfa_enabled: req.body.is_mfa_enabled || "false",
            mfa_type: req.body.mfa_type || "email",
            passkey: req.body.passkey || null,
            biometric_data: req.body.biometric_data || null,
            authenticator_secret: req.body.authenticator_secret || null,
        });

        const savedLogin = await newLogin.save();
        res.status(201).json({ success: true, message: 'User registered successfully' });
    } catch (err) {
        console.error('Error registering user:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

app.post('/verify-hospital', async (req, res) => {
    console.log("triggering @@")
    const { email, password, role } = req.body;
    console.log(req.body);

    if (!email || !password || !role) {
        return res.status(400).json({ success: false, message: 'Email, password, and role are required.' });
    }

    const hashPassword = async (plainTextPassword) => {
        const saltRounds = 10;
        try {
            const hashedPassword = await bcrypt.hash(plainTextPassword, saltRounds);
            return hashedPassword;
        } catch (err) {
            throw new Error('Error hashing password');
        }
    };

    try {
        const existingUser = await Hospitals.findOne({ "contactInformation.email": email });

        if (existingUser) {
            // If the email exists, update the password and role
            const hashedPassword = await hashPassword(password);
            existingUser.password = hashedPassword;
            existingUser.role = role;

            // Save the updated user info
            await existingUser.save();

            return res.status(200).json({ success: true, message: 'User updated successfully' });
        } else {
            // If the email doesn't exist, send a message indicating not found
            return res.status(404).json({ success: false, message: 'User not found' });
        }
    } catch (err) {
        console.error('Error handling request:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

app.post('/verify-staff', async (req, res) => {
    console.log("triggering @@")
    const { email, password, role } = req.body;
    console.log(req.body);

    if (!email || !password) {
        return res.status(400).json({ success: false, message: 'Email, password,  are required.' });
    }

    const hashPassword = async (plainTextPassword) => {
        const saltRounds = 10;
        try {
            const hashedPassword = await bcrypt.hash(plainTextPassword, saltRounds);
            return hashedPassword;
        } catch (err) {
            throw new Error('Error hashing password');
        }
    };

    try {
        const existingUser = await staff.findOne({ "email": email });

        if (existingUser) {
            // If the email exists, update the password and role
            const hashedPassword = await hashPassword(password);
            existingUser.password = hashedPassword;
            existingUser.role = role;

            // Save the updated user info
            await existingUser.save();

            return res.status(200).json({ success: true, message: 'staff updated successfully' });
        } else {
            // If the email doesn't exist, send a message indicating not found
            return res.status(404).json({ success: false, message: 'staff not found' });
        }
    } catch (err) {
        console.error('Error handling request:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});


const authenticateToken = async (req, res, next) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
        console.log("No token found");
        return res.status(401).json({ message: "Access token required" });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);

        // Check if user exists in MongoDB
        const user = await Login.findOne(decoded.email);
        if (!user) {
            console.log("User not found in database");
            return res.status(403).json({ message: "Invalid token or user not found" });
        }

        console.log("Token verified successfully");
        req.user = user; // Attach user data to request
        next();
    } catch (err) {
        console.log("Token verification failed:", err);
        return res.status(403).json({ message: "Invalid or expired token" });
    }
};

app.post('/login', async (req, res) => {
    try {
        const user = await Login.findOne({ email: req.body.email });
        if (!user) {
            const hospitals = await Hospitals.findOne({ "contactInformation.email": req.body.email });
            if (!hospitals) {
                // return res.status(400).json({ message: 'Invalid Email' });
                const staffOne = await staff.findOne({ "email": req.body.email })
                const isMatch = await bcrypt.compare(req.body.password, staffOne.password);
                const accessToken = jwt.sign({ userId: staffOne.email }, secretKey, { expiresIn: '5h' });
                const refreshToken = jwt.sign({ userId: staffOne.email }, secretRefreshKey, { expiresIn: '7d' });

                return res.json({ success: "Login SuccessFully", accessToken, refreshToken });
            }

            const isMatch = await bcrypt.compare(req.body.password, hospitals.password);
            if (!isMatch) {
                return res.status(400).json({ message: 'Invalid Password' });
            }

            // Create a JWT token
            const accessToken = jwt.sign({ userId: hospitals.email }, secretKey, { expiresIn: '5h' });
            const refreshToken = jwt.sign({ userId: hospitals.email }, secretRefreshKey, { expiresIn: '7d' });

            res.json({ success: "Login SuccessFully", accessToken, refreshToken, role: hospitals.role });
        }
        if (user) {

            const isMatch = await bcrypt.compare(req.body.password, user.password);
            if (!isMatch) {
                return res.status(400).json({ message: 'Invalid Password' });
            }

            // Create a JWT token
            const accessToken = jwt.sign({ userId: user.email }, secretKey, { expiresIn: '5h' });
            const refreshToken = jwt.sign({ userId: user.email }, secretRefreshKey, { expiresIn: '7d' });

            res.json({ success: "Login SuccessFully", mfa: user.is_mfa_enabled, accessToken, refreshToken, role: "Super_Admin",mfaTypes:user.mfa_type });
        }
    } catch (err) {
        console.error('Error logging in:', err);
        res.status(500).send('Server error');
    }
});

app.get("/validate-refresh/:id", (req, res) => {
    const { id } = req.params
    jwt.verify(id, secretRefreshKey, (err, user) => {
        if (err) {
            return res.status(403).json({ success: false, error: "Invalid or expired refresh token" });
        }

        // Generate a new access token
        const accessToken = jwt.sign({ userId: user.email }, secretKey, { expiresIn: '5h' })

        res.json({ success: true, accessToken });
    });
});

// Endpoint to generate TOTP secret and QR code
app.get("/generate", (req, res) => {
    const secret = speakeasy.generateSecret({
        name: "WONDIGI", // Replace with your app's name
    });
    console.log('generating qr code')
    qrUserCodes.push(secret)
    qrcode.toDataURL(secret.otpauth_url, (err, dataUrl) => {
        if (err) {
            return res.status(500).send("Error generating QR code");
        }

        res.json({
            secret: secret.base32, // Store this in your database
            qrCode: dataUrl,
        });
    });
});

app.use((req, res, next) => {
    const error = new HttpError('Could not find this route .', 404)
    throw error

});

app.use((error, req, res, next) => {
    if (res.headerSent) {
        return next(error);
    }
    res.status(error.code || 500)
    res.json({ message: error.message || 'An Unknown error occured' })
})

app.get("/")
mongoose.connect(`mongodb+srv://sandhya:123@cluster0.ddkdz.mongodb.net/wonpulse?retryWrites=true&w=majority&appName=Cluster0`).then(app.listen(5000, () => {
    console.log("server is running at 5000")
    console.log("connected to mongodb")
})).catch(err => {
    console.log(err)
    console.log("Connection error")
}
)

