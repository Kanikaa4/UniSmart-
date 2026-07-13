const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const { getDbMode } = require('../config/db');
const mockStore = require('../config/mockStore');
const Faculty = require('../models/Faculty');
const Otp = require('../models/Otp');

const JWT_SECRET = process.env.JWT_SECRET || 'unismart_jwt_secret_key';

// Transporter configuration (loads from env, or uses fallback)
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.ethereal.email',
    port: process.env.SMTP_PORT || 587,
    auth: {
        user: process.env.SMTP_USER || '',
        pass: process.env.SMTP_PASS || ''
    }
});

const sendOtp = async (req, res) => {
    const { email, role } = req.body;

    if (!email) {
        return res.status(400).json({ error: 'Email address is required.' });
    }

    try {
        const isMock = getDbMode();
        let userExists = false;

        // Verify authorization roles
        if (role === 'admin') {
            userExists = (email === 'admin@unismart.edu');
        } else if (role === 'faculty') {
            if (isMock) {
                userExists = mockStore.facultyList.some(f => f.email === email);
            } else {
                const fac = await Faculty.findOne({ email });
                userExists = !!fac;
            }
        }

        if (!userExists) {
            return res.status(404).json({ error: `No registered ${role} profile found with this email.` });
        }

        // Generate 6-digit OTP
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes validity
        const hashedOtp = await bcrypt.hash(otpCode, 10);

        // Store OTP
        if (isMock) {
            mockStore.otps[email] = { otp: hashedOtp, expiresAt };
        } else {
            // Upsert OTP record
            await Otp.findOneAndUpdate(
                { email },
                { otp: hashedOtp, expiresAt },
                { upsert: true, new: true }
            );
        }

        console.log(`[UniSmart SMTP Simulator] Generated OTP for ${email}: ${otpCode}`);

        // Dispatch verification email
        let mailSent = false;
        if (process.env.SMTP_USER && process.env.SMTP_PASS) {
            try {
                await transporter.sendMail({
                    from: '"UniSmart Admin" <no-reply@unismart.edu>',
                    to: email,
                    subject: 'UniSmart Verification Code',
                    text: `Your one-time authentication code is: ${otpCode}. It expires in 5 minutes.`,
                    html: `<h3>UniSmart Verification Portal</h3><p>Your OTP code is: <strong>${otpCode}</strong></p><p>Valid for 5 minutes.</p>`
                });
                mailSent = true;
            } catch (err) {
                console.error('Mail dispatch failed:', err.message);
            }
        }

        return res.status(200).json({
            success: true,
            message: 'OTP dispatched successfully.',
            // Return code in JSON response if SMTP parameters are missing to facilitate local testing
            simulatedOtp: mailSent ? undefined : otpCode
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Server authentication request failed.' });
    }
};

const verifyOtp = async (req, res) => {
    const { email, otp, role } = req.body;

    if (!email || !otp) {
        return res.status(400).json({ error: 'Email and verification code are required.' });
    }

    try {
        const isMock = getDbMode();
        let otpRecord;

        if (isMock) {
            otpRecord = mockStore.otps[email];
        } else {
            otpRecord = await Otp.findOne({ email });
        }

        if (!otpRecord) {
            return res.status(400).json({ error: 'No verification request active for this email.' });
        }

        // Expiry check
        if (new Date() > new Date(otpRecord.expiresAt)) {
            if (isMock) delete mockStore.otps[email];
            else await Otp.deleteOne({ email });
            return res.status(400).json({ error: 'Verification code has expired.' });
        }

        // Validate code
        const isCodeValid = await bcrypt.compare(otp, otpRecord.otp);
        if (!isCodeValid) {
            return res.status(400).json({ error: 'Incorrect verification code.' });
        }

        // Retrieve user details
        let userDetails = { email, role };
        if (role === 'faculty') {
            if (isMock) {
                const fac = mockStore.facultyList.find(f => f.email === email);
                userDetails = { ...userDetails, name: fac.name, department: fac.department, id: fac._id, subjects: fac.subjects || [] };
            } else {
                const fac = await Faculty.findOne({ email });
                userDetails = { ...userDetails, name: fac.name, department: fac.department, id: fac._id, subjects: fac.subjects || [] };
            }
        }

        // Generate Session Token
        const token = jwt.sign(
            { id: userDetails.id || 'admin', email: userDetails.email, role: userDetails.role },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        // Delete used OTP
        if (isMock) {
            delete mockStore.otps[email];
        } else {
            await Otp.deleteOne({ email });
        }

        return res.status(200).json({
            success: true,
            token,
            user: userDetails
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Verification request failed.' });
    }
};

module.exports = { sendOtp, verifyOtp };
