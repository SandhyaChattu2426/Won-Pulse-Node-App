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
const PharmaBillRequests = require('./routes/PBillRequests')
const Login = require('./models/Users');
const staff = require("./models/staff");
const Patient = require("./models/patient")
const dashboardRoutes = require('./routes/dashboardRoutes')
const { MongoClient } = require("mongodb");
const dashboardReportRoutes = require('./routes/DashboardReports')
const RoleRoutes = require('./routes/RolesRoutes')
const HospitalFunction = require('./controllers/patients-controllers')


require('dotenv').config();
const secretKey = process.env.JWT_SECRET;
const secretRefreshKey = process.env.JWT_REFRESH_SECRET;
const uri = process.env.MONGO_URI || "mongodb+srv://sandhya:123@cluster0.ddkdz.mongodb.net/wonpulse?retryWrites=true&w=majority";
const client = new MongoClient(uri);
const path = require("path");
const fs = require("fs");
app.use(bodyParser.json())
const allowedOrigins = process.env.ALLOWEDURLS?.split(',').map(origin => origin.replace(/\/$/, ''));

const corsOptions = {
    origin: (origin, callback) => {
        console.log("Incoming Origin", origin);
        console.log("Allowed Origins", allowedOrigins);

        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            console.error(`Blocked by CORS: ${origin}`);
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS','PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
};

app.use(cors(corsOptions));
app.use('/api/patient', patientsRoutes);
app.use('/api/staff', StaffRoutes)
app.use('/api/role', RoleRoutes)
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
app.use('/api/dashboard', dashboardRoutes)
app.use('/api/dashboardReports', dashboardReportRoutes)
app.use('/api/doctor/requestbill', PharmaBillRequests)

// app.use('/api/users', usersRoutes)
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

const otpStorage = {}; // Store OTPs temporarily

const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

const AdminWelcomeTemplate = async (hospital) => {
    const { hospitalDetails, AdministrativeDetails, contactInformation } = hospital
    const emailTemplatePath = path.join(
        __dirname,
        ".",
        "EmailTemplates",
        "AdminWelcome.html"
    );
    let emailTemplate = fs.readFileSync(emailTemplatePath, "utf-8");
    const url = `${process.env.ALLOWEDURLS}/admin/`
    const today = new Date();
    const activationDate = today.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
    emailTemplate = emailTemplate
        .replace(/{{hospital_name}}/g, hospitalDetails.hospitalName || "WON PULSE")
        .replace(/{{hospital_id}}/g, hospitalDetails.hospitalId || "WON PULSE")
        .replace(/{{activation_date}}/g, activationDate)
        .replace(/{{navigation_url}}/g, url)
        .replace(/{{mobile}}/g, "7893536373")
        .replace(/{{adress}}/g, "umashankarNagar,NowITServicervicesIndia.pvt.Ltd")
        .replace(/{{mail}}/g, "wonPulse@gmail.com");
    ;

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: contactInformation.email,
        subject: "WONPULSE:  You're Almost In! Complete Your Won Pulse Registration",
        html: emailTemplate,
    };

    return transporter.sendMail(mailOptions);
}
const PatientWelcomeTemplate = async (patient) => {
    const { fullName, patientId, hospitalName, hospitalId, email } = patient
    const emailTemplatePath = path.join(
        __dirname,
        ".",
        "EmailTemplates",
        "PatientWelcome.html"
    );
    let emailTemplate = fs.readFileSync(emailTemplatePath, "utf-8");
    const url = `${process.env.ALLOWEDURLS}/admin/patient/tableview`
    const today = new Date();
    const activationDate = today.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
    const hospital = await HospitalFunction.GetHospitalDetails(hospitalId)

    emailTemplate = emailTemplate
        .replace(/{{patient_name}}/g, fullName || "WON PULSE")
        .replace(/{{hospital_name}}/g, hospitalName || "WON PULSE")
        .replace(/{{patient_id}}/g, patientId || "WON PULSE")
        .replace(/{{registration_date}}/g, activationDate)
        .replace(/{{navigation_url}}/g, url)
        .replace(/{{mobile}}/g, hospital.mobile || "WON PULSE")
        .replace(/{{adress}}/g, hospital.adress)
        .replace(/{{mail}}/g, hospital.email);

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: "WONPULSE:  You're Almost In! Complete Your Won Pulse Registration",
        html: emailTemplate,
    };
    return transporter.sendMail(mailOptions);
}


const staffWelcomeTemplate = async (staff) => {
    const { fullName, staffId, hospitalName, department, doctorType, email, hospitalId } = staff
    const emailTemplatePath = path.join(
        __dirname,
        ".",
        "EmailTemplates",
        "StaffWelcomeTemplate.html"
    );
    let emailTemplate = fs.readFileSync(emailTemplatePath, "utf-8");
    const url = `${process.env.ALLOWEDURLS}/admin/staff/tableview`
    const today = new Date();
    const activationDate = today.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
    const hospital = await HospitalFunction.GetHospitalDetails(hospitalId)
    emailTemplate = emailTemplate
        .replace(/{{staff_name}}/g, fullName || "WON PULSE")
        .replace(/{{hospital_name}}/g, hospitalName || "WON PULSE")
        .replace(/{{staff_id}}/g, staffId || "WON PULSE")
        .replace(/{{department}}/g, department || doctorType)
        .replace(/{{activation_date}}/g, activationDate)
        .replace(/{{navigation_url}}/g, url)
        .replace(/{{mobile}}/g, hospital.mobile || "WON PULSE")
        .replace(/{{adress}}/g, hospital.adress)
        .replace(/{{mail}}/g, hospital.email);


    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: "WONPULSE:  You're Almost In! Complete Your Won Pulse Registration",
        html: emailTemplate,
    };
    return transporter.sendMail(mailOptions);
}
// const sendOTP = async (email, otp) => {
//     // console.log(otp, "triffering")
//     const mailOptions = {
//         from: process.env.EMAIL_USER,
//         to: email,
//         subject: 'WONPULSE: Your One-Time Password (OTP)',
//         html: `
//             <div style="background-color: #f4f4f4; padding: 20px; text-align: center; font-family: Arial, sans-serif;">
//                 <div style="max-width: 400px; margin: auto; background: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
//                     <h2 style="color: #333;">WONDigi: OTP Verification</h2>
//                     <p style="color: #555; font-size: 16px;">Use the following OTP to complete your verification:</p>
//                     <div style="font-size: 24px; font-weight: bold; color: #007bff; padding: 10px 20px; background: #e0f2ff; display: inline-block; border-radius: 5px;">
//                         ${otp}
//                     </div>
//                     <p style="color: #888; font-size: 14px; margin-top: 20px;">This OTP is valid for only 10 minutes. Do not share it with anyone.</p>
//                 </div>
//             </div>
//         `,
//     };

//     return transporter.sendMail(mailOptions);
// };
const sendOTP = async (email, otp, hospitalName, hospitalLogo, hospitalMail, hospitalContact, hospitalAddress) => {
    const emailTemplatePath = path.join(
        __dirname,
        "EmailTemplates",
        "OTPTemplate.html"
    );
    let emailTemplate = fs.readFileSync(emailTemplatePath, "utf-8");
    emailTemplate = emailTemplate
        .replace(/{{otp}}/g, otp)
        .replace(/{{hospital_name}}/g, hospitalName || "WON DIGI")
        .replace(/{{hospital_logo}}/g, hospitalLogo || "https://res.cloudinary.com/dca9sij3n/image/upload/f_auto,q_auto/hunqedjlmgyb4bdswike")
        .replace(/{{hospital_email}}/g, hospitalMail || "wondigi@gmail.com")
        .replace(/{{hospital_contact}}/g, hospitalContact || "1234567890")
        .replace(/{{hospital_adress}}/g, hospitalAddress || "Umashankar Nagar, Vijayawada, Andhra Pradesh, India - 527001")


    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: "WONPULSE:  Your One-Time Password (OTP)",
        html: emailTemplate,
    };

    return transporter.sendMail(mailOptions);
};

app.post('/send-email-otp-forPassword', async (req, res) => {
    const { email } = req.body;
    // console.log('Received email:', email);

    try {
        // Check if email exists in either Login or Staff collection
        const user = await Login.findOne({ email: email });
        const staffOne = await staff.findOne({ email: email });

        if (user || staffOne) {
            const otp = generateOTP()

            otpStorage[email] = { otp, expiry: Date.now() + 120000 }; // Store OTP with a 2-minute expiry

            await sendOTP(email, otp); // Send OTP to the email

            // console.log('Email OTP sent successfully.');
            // console.log(otpStorage);

            return res.status(200).json({ message: 'OTP sent successfully!' });
        } else {
            return res.status(400).json({ message: 'User does not exist' });
        }
    } catch (error) {
        // console.log('Error checking email or sending OTP:', error);
        res.status(500).json({ error, message: 'Internal Server Error.' });
    }
});

app.post('/send-email-otp', async (req, res) => {
    const { email } = req.body;
    console.log(email)

    // Check if the email already exists in the database
    try {
        const user = await Login.findOne({ email: email });

        if (!user) {
            const otp = generateOTP();
            otpStorage[email] = { otp, expiry: Date.now() + 120000 };  // Store OTP with an expiry of 2 minutes
            console.log(otp)
            await sendOTP(email, otp, hospitalName = "WONPULSE", hospitalLogo = "https://res.cloudinary.com/dca9sij3n/image/upload/f_auto,q_auto/hunqedjlmgyb4bdswike", hospitalMail = "mummy@gmail.com", hospitalContact = "1234567890", hospitalAddress = "Umashankar Nagar, Vijayawada, Andhra Pradesh, India - 527001");
            res.status(200).json({ message: 'OTP sent successfully!' });
        }
        else {
            return res.status(400).json({ message: 'User does not Exist' });

        }

    } catch (error) {
        // console.log('Error checking email or sending OTP:', error);
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

            // console.log(otp);

            // Send OTP to the email (assume sendOTP handles email delivery)
            await sendOTP(email, otp);
            res.status(200).json({ message: 'OTP sent successfully!' });
        }
        else {
            return res.status(400).json({ message: 'User does not Exist' });

        }

    } catch (error) {
        // console.log('Error checking email or sending OTP:', error);
        res.status(500).json({ error, message: 'Internal Server Error.' });
    }
});
app.post('/send-staff-email-otp', async (req, res) => {
    const { email } = req.body;
    try {
        const user = await staff.findOne({ "email": email }); // MongoDB query using Mongoose
        console.log(user)
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
        // console.log('Error checking email or sending OTP:', error);
        res.status(500).json({ error, message: 'Internal Server Error.' });
    }
});
app.post('/send-patient-email-otp', async (req, res) => {
    const { email } = req.body;
    console.log(email)
    try {
        const user = await Patient.findOne({ "email": email }); // MongoDB query using Mongoose
        if (user) {
            const otp = generateOTP(); // Assume generateOTP() generates a random OTP
            otpStorage[email] = { otp, expiry: Date.now() + 120000 };  // Store OTP with an expiry of 2 minutes

            console.log(otp);


            await sendOTP(email, otp, hospitalName = "WONPULSE", hospitalLogo = "https://res.cloudinary.com/dca9sij3n/image/upload/f_auto,q_auto/hunqedjlmgyb4bdswike", hospitalMail = "mummy@gmail.com", hospitalContact = "1234567890", hospitalAddress = "Umashankar Nagar, Vijayawada, Andhra Pradesh, India - 527001"); // Send OTP to the email

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

const sendOTPForRegistration = async (email, Id, hospitalId, path) => {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'WONPULSE: Complete Your Registration Process',
        html: `
            <a href=http://localhost:5173/${path}/${Id}/hospital/${hospitalId}>
               style="color: #007bff; text-decoration: none; font-weight: bold;">
                Click the link  to complete your registration Process
            </a>
        `,
    };
    return transporter.sendMail(mailOptions);
};

app.post('/EmailStaff', async (req, res) => {
    const { email, Id, hospitalId } = req.body;
    try {
        await sendOTPForRegistration(email, Id, hospitalId, path = "staff");
        res.status(200).json({ message: 'OTP sent successfully!' });

    } catch (error) {
        res.status(500).json({ error, message: 'Internal Server Error.' });
    }
});

app.post('/EmailHospital', async (req, res) => {

    const { email, Id } = req.body;
    try {
        await sendOTPHospital(email, Id);
        res.status(200).json({ message: 'OTP sent successfully!' });
    } catch (error) {
        res.status(500).json({ error, message: 'Internal Server Error.' });
    }
});
const sendOTPHospital = async (email, Id) => {
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

app.post('/EmailPatient', async (req, res) => {
    const { email, Id, hospitalId } = req.body;
    try {
        await sendOTPForRegistration(email, Id, hospitalId, path = "patient");
        res.status(200).json({ message: 'OTP sent successfully!' });

    } catch (error) {
        res.status(500).json({ error, message: 'Internal Server Error.' });
    }
});

const verifyOtp = (email, otp) => {
    const storedOtpData = otpStorage[email];
    // console.log(storedOtpData.otp, "*****")

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
            // console.log("ok,working")
            return { status: 200, message: 'OTP verified successfully!' };
        } else {
            return { status: 400, message: 'Invalid OTP.' };
        }
    } catch (error) {
        console.error('Error verifying OTP:', error);
        return { status: 500, message: 'Internal server error.' };
    }
};

app.post('/verify-otp', (req, res) => {
    const { email, otp } = req.body;
    const result = verifyOtp(email, otp);
    return res.status(result.status).json({ message: result.message });
});

//login otp verification
app.post('/verify-login-otp', (req, res) => {
    const { email, otp } = req.body;
    // console.log(email, otp)

    const result = verifyOtp(email, otp);
    // console.log(result)

    return res.status(result.status).json({ message: result.message });
})


// Register Login
app.post('/api/register-login', async (req, res) => {
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
            title: req.body.hospitalName || null,
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
            passkey: req.body.passkey || null,
            biometric_data: req.body.biometric_data || null,
            authenticator_secret: req.body.authenticator_secret || null,
            patient_id: req.body.patient_id || null,
            hospital_id: req.body.hospital_id || null
        });

        const savedLogin = await newLogin.save();
        res.status(201).json({ success: true, message: 'User registered successfully' });
    } catch (err) {
        console.log(err, "error")
        console.error('Error registering user:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

app.post('/api/verify-hospital', async (req, res) => {
    const { email, password, role } = req.body;
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
            const hashedPassword = await hashPassword(password);
            existingUser.password = hashedPassword;
            existingUser.role = role;
            await existingUser.save();
            await AdminWelcomeTemplate(existingUser)
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

app.post('/api/verify-staff', async (req, res) => {
    const { email, password, role } = req.body;
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
        console.log(existingUser)

        if (existingUser) {
            const hashedPassword = await hashPassword(password);
            existingUser.password = hashedPassword;
            await existingUser.save();
            await staffWelcomeTemplate(existingUser)
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

app.post('/api/verify-patient', async (req, res) => {
    const { email, password } = req.body;
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
        const existingUser = await Patient.findOne({ "email": email });

        if (existingUser) {
            const hashedPassword = await hashPassword(password);
            existingUser.password = hashedPassword;

            await existingUser.save();
            await PatientWelcomeTemplate(existingUser)

            return res.status(200).json({ success: true, message: 'patient updated successfully' });
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
        // console.log("No token found");
        return res.status(401).json({ message: "Access token required" });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);

        // Check if user exists in MongoDB
        const user = await Login.findOne(decoded.email);
        if (!user) {
            // console.log("User not found in database");
            return res.status(403).json({ message: "Invalid token or user not found" });
        }

        // console.log("Token verified successfully");
        req.user = user; // Attach user data to request
        next();
    } catch (err) {
        // console.log("Token verification failed:", err);
        return res.status(403).json({ message: "Invalid or expired token" });
    }
};

app.post('/login', async (req, res, next) => {
    try {
        const user = await Login.findOne({ email: req.body.email });
        console.log(user, "userHERee")
        if (user.user_type === "Hospital") {
            const isMatch = await bcrypt.compare(req.body.password, user.password);
            if (!isMatch) {
                return res.status(400).json({ message: 'Invalid Password' });
            }
            // console.log('login request recieved', user);

            const accessToken = jwt.sign({ userId: user.email }, secretKey, { expiresIn: '5h' });
            const refreshToken = jwt.sign({ userId: user.email }, secretRefreshKey, { expiresIn: '7d' });
            res.json({ success: "Login SuccessFully", accessToken, refreshToken, role: "admin" });
        }

        if (user.user_type === "Staff") {
            const isMatch = await bcrypt.compare(req.body.password, user.password);
            if (!isMatch) {
                return res.status(400).json({ message: 'Invalid Password' });
            }
            const accessToken = jwt.sign({ userId: user.email }, secretKey, { expiresIn: '5 h' });
            const refreshToken = jwt.sign({ userId: user.email }, secretRefreshKey, { expiresIn: '7d' })// from the staff signup send the role at here and provide at there
            return res.json({ success: "Login SuccessFully", accessToken, refreshToken, mfa: user.is_mfa_enabled, role: "staff", mfaTypes: user.mfa_type });
        }
        if (user.user_type === "Patient") {
            const isMatch = await bcrypt.compare(req.body.password, user.password);
            if (!isMatch) {
                return res.status(400).json({ message: 'Invalid Password' });
            }
            const accessToken = jwt.sign({ userId: user.email }, secretKey, { expiresIn: '5 h' });
            const refreshToken = jwt.sign({ userId: user.email }, secretRefreshKey, { expiresIn: '7d' })// from the staff signup send the role at here and provide at there
            return res.json({ success: "Login SuccessFully", accessToken, refreshToken, mfa: user.is_mfa_enabled, role: "Patient", mfaTypes: user.mfa_type, patientId: user.patient_id, hospitalId: user.hospital_id });
        }

        const isMatch = await bcrypt.compare(req.body.password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid Password' });
        }
        const accessToken = jwt.sign({ userId: user.email }, secretKey, { expiresIn: '5h' });
        const refreshToken = jwt.sign({ userId: user.email }, secretRefreshKey, { expiresIn: '7d' });
        res.json({ success: "Login SuccessFully", mfa: user.is_mfa_enabled, accessToken, refreshToken, role: "user", mfaTypes: user.mfa_type });
    } catch (e) {
        console.log(e)
    }
})

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
    // console.log('generating qr code')
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

app.post('/get/report-data', async (req, res) => {
    // console.log("getting")
    const { aggregation, groupBy, selectedTable, stackBy, filterConditions, dateLabel } = req.body;

    try {
        await client.connect();
        const db = client.db('wonpulse');
        const collection = db.collection(selectedTable);
        // console.log(collection)

        if (!selectedTable) {
            return res.status(400).send({ error: 'Selected table is required.' });
        }

        // Build filters
        const filters = {};
        if (filterConditions && filterConditions.length > 0) {
            filterConditions.forEach(({ column, operation, value }) => {
                if (!column || !operation || value === undefined) {
                    return;
                }

                // Ensure correct data type for value
                if (!isNaN(value)) {
                    value = Number(value);
                }

                switch (operation) {
                    case 'Contains':
                        filters[column] = { $regex: new RegExp(value, 'i') }; // Case-insensitive partial match
                        break;

                    case 'Equals':
                        filters[column] = { $eq: value }; // Exact match
                        break;

                    case 'Greater Than':
                        filters[column] = { $gt: value }; // Greater than
                        break;

                    case 'Less Than':
                        filters[column] = { $lt: value }; // Less than
                        break;

                    case 'Greater Than or Equal To':
                        filters[column] = { $gte: value }; // Greater than or equal to
                        break;

                    case 'Less Than or Equal To':
                        filters[column] = { $lte: value }; // Less than or equal to
                        break;

                    case 'Starts With':
                        filters[column] = { $regex: new RegExp(`^${value}`, 'i') }; // Starts with
                        break;

                    case 'Ends With':
                        filters[column] = { $regex: new RegExp(`${value}$`, 'i') }; // Ends with
                        break;

                    case 'Is Empty':
                        filters[column] = { $in: [null, ''] }; // Match null or empty string
                        break;

                    case 'Is Not Empty':
                        filters[column] = { $nin: [null, ''] }; // Exclude null and empty string
                        break;

                    case 'Is Any Of':
                        filters[column] = { $in: Array.isArray(value) ? value : [value] }; // Match any value in the array
                        break;

                    default:
                        console.warn('Unsupported operation:', operation);
                        break;
                }
            });

            // console.log('Generated filters:', filters);
        }

        if (dateLabel && groupBy) {
            const dateLabelFormat = dateLabel === 'M' ? '%B' : '%Y-%m-%d';
            const pipeline = [
                { $match: filters },
                {
                    $group: {
                        _id: { $dateToString: { format: dateLabelFormat, date: `$${groupBy}` } },
                        count: { $count: {} }
                    }
                },
                { $sort: { _id: 1 } }
            ];

            const results = await collection.aggregate(pipeline).toArray();
            return res.send({ generatedReportData: results, orderByResult: [] });
        }

        // General report data aggregation
        const pipeline = [];

        // Apply filters
        if (Object.keys(filters).length > 0) {
            pipeline.push({ $match: filters });
        }

        // Grouping and aggregation
        if (aggregation && groupBy) {
            const groupStage = {
                _id: `$${groupBy}`,
                [`${groupBy}_count`]: { $sum: 1 },
            };

            if (stackBy) {
                groupStage._id = {
                    groupBy: `$${groupBy}`,
                    stackBy: `$${stackBy}`,
                };
            }

            pipeline.push({ $group: groupStage });
        }

        // Sorting
        if (groupBy) {
            pipeline.push({ $sort: { _id: 1 } });
        }

        const reportResult = await collection.aggregate(pipeline).toArray();

        // Generate orderBy query
        const orderByPipeline = [
            { $match: filters },
            { $sort: { [groupBy || '_id']: 1 } },
            { $limit: 100 }
        ];

        const orderByResult = await collection.aggregate(orderByPipeline).toArray();

        // console.log(reportResult);
        // console.log(reportResult.map(item => ({ [groupBy]: item?._id?.groupBy || item._id, [Object.keys(item)[1]]: Object.values(item)[1] })))

        res.send({ generatedReportData: reportResult.map(item => ({ [groupBy]: item?._id?.groupBy || item._id, [Object.keys(item)[1]]: Object.values(item)[1] })), orderByResult });
    } catch (error) {
        console.log('Error fetching report data:', error);
        res.status(500).send({ error: 'An error occurred while fetching report data.' });
    }
    //  finally {
    //     await client.close();
    // }
});

const sendContactedUsers = async (email, fullName, contact) => {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: "testmail@gmail.com",
        subject: 'WONPULSE: DETAILS OF THE USER CONTACTING US',
        html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.6;">
                <p>Hello Team,</p>
                <p>Someone has contacted us to get more information. Here are the details:</p>
                <ul>
                    <li><strong>Full Name:</strong> ${fullName}</li>
                    <li><strong>Email:</strong> ${email}</li>
                    <li><strong>Contact:</strong> ${contact}</li>
                </ul>
            </div>
        `,
    };

    return transporter.sendMail(mailOptions);
};


app.post('/sendRequesttonowit', async (req, res) => {
    try {
        const { email, fullName, contact } = req.body;
        await sendContactedUsers(email, fullName, contact);

        res.status(200).json({
            success: true,
            message: "Email sent successfully",
        });
    } catch (error) {
        console.error("Error sending email:", error);

        res.status(500).json({
            success: false,
            message: "Failed to send email",
        });
    }
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
// by me
// app.use(cors({
//     origin: "http://localhost:5173",
//     methods: ["GET", "POST", "PUT", "DELETE"],
//     allowedHeaders: ["Content-Type", "Authorization"]
// }));

// ✅ Middleware
app.use(express.json()); // To handle JSON requests
app.use(express.urlencoded({ extended: true }));

app.get("/")
mongoose.connect(`mongodb+srv://sandhya:123@cluster0.ddkdz.mongodb.net/wonpulse?retryWrites=true&w=majority&appName=Cluster0`).then(app.listen(process.env.PORT, () => {
    console.log("server is running at 5000")
    console.log("connected to mongodb")
})).catch(err => {
    console.log(err)
    // console.log("Connection error")
}
)

