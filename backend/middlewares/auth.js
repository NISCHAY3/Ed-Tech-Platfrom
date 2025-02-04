const jwt = require('jsonwebtoken');
require('dotenv').config();
const User = require("../models/User");

//auth
exports.auth = async (req, res, next) => {
    try {
        //extract token

        const token = req.cookies.toekn
            || req.body.token
            || req.header("Authorization").replace("Bearer ", "");


        if (!token) {
            return res.status(401).json({
                success: false,
                message: "token is missing",
            })
        }
        //verify token
        try {
            const decode = jwt.verify(token, process.env.JWT_SECRET);
            req.user = decode;
        }
        catch (err) {

            return res.status(401).json({
                success: fasle,
                message: "token is invalid",
            });

        }

        next();
    }

    catch (err) {
        return res.status(500).json({
            success: false,
            message: "something wnt worng",
        })
    }
}

//isStudent
exports.isStudent = async (req, res, next) => {
    try {

        if (req.user.accountType !== "Student") {
            return res.status(401).json({
                success: false,
                message: "this is protected route for student only"
            })
        }

        next();

    }
    catch (err) {

        return res.status(500).json({
            success: fasle,
            message: "user role cannot be verified",
        })
    }
}

//isInstructor
exports.isInstructor = async (req, res, next) => {
    try {

        if (req.user.accountType !== "Instructor") {
            return res.status(401).json({
                success: false,
                message: "this is protected route for Instructors only"
            })
        }

        next();

    }
    catch (err) {

        return res.status(500).json({
            success: fasle,
            message: "user role cannot be verified",
        })
    }
}

//isAdmin
exports.isAdmin = async (req, res, next) => {
    try {

        if (req.user.accountType !== "Admin") {
            return res.status(401).json({
                success: false,
                message: "this is protected route for admin only"
            })
        }

        next();

    }
    catch (err) {

        return res.status(500).json({
            success: fasle,
            message: "user role cannot be verified",
        })
    }
}