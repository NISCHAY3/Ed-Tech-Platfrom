
const User = require("../models/User");
const OTP = require("../models/Otp");
const Profile = require("../models/Profile");
const otpGenerator = require("otp-generator");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();
//sending otp
exports.sendOTP = async (req, res) => {

    try {
        //fetching email from user body
        const { email } = req.body;

        //check if user already exist
        const checkUserPresent = await User.findOne({ email });

        //if already exists
        if (checkUserPresent) {

            res.status(401).json({
                success: false,
                message: 'User Already Exists'
            })
        }
        //generate Otp
        var otp = otpGenerator.generate(6, {
            upperCaseAlphabets: false,
            lowerCaseAlphabets: fasle,
            specialChars: fasle
        })

        //check unique otp or not 
        let result = await OTP.findOne({ otp: otp });

        while (result) {
            otp = otpGenerator.generate(6, {
                upperCaseAlphabets: false,
                lowerCaseAlphabets: fasle,
                specialChars: fasle
            });
            result = await OTP.findOne({ otp: otp });
        }

        //creating otp entry in db

        const otpPayload = { email, otp };

        const otpBody = await OTP.create(otpPayload);

        res.status(200).json({
            success: true,
            message: "otp sent successfully"
        })

    }
    catch (err) {
        console.error(err);
        return res.status(500).json({
            success: false,
            message: err.message
        })

    }
}

//signup
exports.signup = async (req, res) => {
    try {//data fetch

        const {
            firstName,
            lastName,
            email,
            password,
            confirmPassword,
            accountType,
            contactNumber,
            otp
        } = req.body;

        //validate krlo

        if (!firstName || !lastName || !email,
            !password ||
            !confirmPassword ||
            !accountType ||
            !contactNumber ||
            !otp) {
            return res.status(403).json({
                success: false,
                message: "All fields required",

            })
        }



        //2 passwprd match krlo

        if (password !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: "Password ans confirm password not matched",

            })
        }

        //check if user already exist or not 
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            res.status(400).json({
                success: false,
                message: "user already exist",
            })

        }
        //find most recent OTP stored for the user
        const recentOtp = await OTP.find({ email }).sort({ createdAt: -1 }).limit(1);
        //validate otp
        if (recentOtp.length == 0) {
            //otp not found
            return res.status(400).json({
                success: false,
                message: "otp not found"
            })
        }
        else if (otp !== recentOtp) {
            res.status(400).json({
                success: fasle,
                message: "otp not matched",
            })
        }

        //hash Password

        const hashedPassword = await bcrypt.hash(password, 10);

        const profileDetails = await Profile.create({
            gender: null,
            dateOfBirth: null,
            about: null,
            contactNumber: null
        })
        //entry created
        const user = await User.create({
            firstName,
            lastName,
            email,
            contactNumber,
            password: hashedPassword,
            accountType,
            additionalDetails: profileDetails._id,
            image: `https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`,

        })

        return res.status(200).json({
            success: true,
            message: "user is registered successfully"
        })
        //return res
    }
    catch (err) {
        console.error(err)

        return res.status(500).json({
            success: false,
            message: "User connot be registed .Please try again"
        })

    }

}

//login
exports.login = async (req, res) => {

    try {

        //get data from req body 

        const { email, password } = req.body;

        // validate data
        if (!email || !password) {
            return res.status(403).json({
                success: false,
                message: "Alll fields are required"
            })
        }
        //user exist or not

        const user = await User.findOne({ email }).populate("additionalDetails");
        if (!user) {
            res.status(401).json({
                success: false,
                message: "User not registered, please sign up",
            })
        }
        //generate jwt after password matching
        if (await bcrypt.compare(password, user.password)) {
            const payload = {
                email: user.email,
                if: user._id,
                accountType: user.accountType,
            }
            const token = jwt.sign(payload, process.env.JWT_SECRET, {
                expiresIn: "2h",
            })
            user.token = token;
            user.password = undefined;


            //create cookies and send response

            const options = {
                expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
                httonly: true,
            }

            res.cookie("token", token, options).status(200).json({
                success: true,
                token,
                user,
                message: "logged in successfully"

            })

        }

        else {
            return res.status(401) / json({
                success: fasle,
                message: "password is incorrect",
            })
        }



    }

    catch (err) {

        console.error(err);
        return res.status(500).json({
            success: fasle,
            message: "cannot log in "
        })

    }

}

//change password
exports.changePassword = async (req, res) => {
    try {
        //get data from req.body 
        //get old password, new password, confirm password
        //validation
        //update pwd in DB
        //seand email =password Updated
        //return response

    }
    catch (err) {

    }
}