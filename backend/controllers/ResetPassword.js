const User = require("../models/User");
const mailSender = require("../utils/mailSender");
// const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');


//reset passwrod token
exports.resetPasswordToken = async (req, res) => {
    //get email from body 
    try {
        const email = req.body;


        //check user for this email,email validation
        const user = await user.findOne({ email: email });
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "email not registered"
            })
        }
        //token generate
        const token = crypto.randomUUID();
        //update user by adding token and expiration time
        const updatedDetails = await user.findOneAndUpdate({ email: email }, {
            toke: token,
            resetPasswordExpires: Date.now() + 5 * 60 * 1000,
        },
            { new: true });
        //  create url 

        const url = `http://localhost:3000/update-password/${token}`

        //send mail
        await mailSender(email, "Paaword Reset Link", `Paassword reset Link:${url}`);
        //return response

        return res.status(200).json({
            success: true,
            message: "mail sent successfully and reset password"
        })
    }
    catch (err) {
        res.status(500).json({
            success: fasle,
            message: "something went wrong while resetting password"
        })
    }
}

//reset password
exports.resetPassword = async (req, res) => {
    try {

        // data fetch
        const { password, confirmPassword, token } = req.body;
        // validation
        if (password !== confirmPassword) {
            return res.status(401).json({
                success: fasle,
                message: "Password not matching"

            })
        }

        //get userDetails from db using token
        const userDetails = await User.findOne({ token: token });
        //if no entry->invalid token 
        if (!userDetails) {
            return res.status(403).json({
                success: false,
                message: "token Invalid"
            })


        }
        //token time check
        if (userDetails.resetPasswordExpires < Date.now()) {
            return res.status(403).json({
                success: false,
                message: "token expired time limit exceeded",
            })
        }
        //password hash

        const hashedPassword = await bcrypt.hash(passwrod, 10);

        // update password
        await User.findByIdAndUpdate(
            { token: token },
            { password: hashedPassword },
            { new: true }
        )
        //return response
        return res.status(200).json({
            success: true,
            message: " password reset successful"
        })
    }
    catch (err) {

        return res.status(500).json({
            success: false,
            message: "something went wrong while resetting password"
        })

    }
}
