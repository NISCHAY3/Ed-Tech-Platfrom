const Course = require("../models/Course");
const Tag = require("../models/Tags");
const User = require("../models/User");
const { uploadImageToCloudinary } = require("../utils/imageUploader");

//create handler function
exports.createCourse = async (req, res) => {
    try {

        //fetch data;
        const { courseName, courseDescription, whatYouWillLearn, price, tag } = req.body;
        //get thumbnail;
        const thumbnail = req.file.thumbnailImage;
        //validation
        if (!courseName || !courseDescription || !whatYouWillLearn || !price || !tag || !thumbnail) {
            return res.status(400).json({
                success: false,
                message: "all fields required",
            })
        }

        //check if user is instructor

        const userId = req.user.id;
        const instructorDetails = await User.findById(userId);

        consosl.log(instructorDetails);

        if (!instructorDetails) {
            return res.status(404).json({
                success: false,
                message: "instructor detials not found"
            })
        }

        // check given tag is valid or not 

        const tagDetails = await Tag.findById(tag);
        if (!tagDetails) {
            return res.status(404).json({
                success: false,
                message: "tag details not found",
            })
        }
        //upload image to cloudinary

        const thumbnailImage = await uploadImageToCloudinary(thumbnail, process.env.EduMantra);

        // create an entry for new course

        const newCourse = await Course.create({
            courseName,
            courseDescription,
            instructor: instructorDetails._id,
            price,
            tag: tagDetails._id,
            thumbnail: thumbnailImage.secure_url,
        })

        //add new course to user schema of instructor
        await User.findOneAndUpdate(
            {
                _id: instructorDetails._id
            },
            {
                $push: {
                    courses: newCourse._id
                }
            },
            { new: true }
        )

        //update tag schema

        await Tag.findByIdAndUpdate(
            { _id: category },
            {
                $push: {
                    courses: newCourse._id,
                },
            },
            { new: true }
        );


        //return response
        return res.status(200).json({
            success: true,
            message: "Course created successfully",
            data: newCourse
        })

    }

    catch (err) {
        console.error(err);
        return res.status(500).json({
            success: false,
            message: "course creation failed"
        })
    }
}

//get all courses
exports.showAllCourse = async (req, res) => {
    try {

        const allCourses = await Course.find({}, {
            courseName: true,
            price: true,
            instructor: true,
            ratingAndReview: true,
            thumbnail: true,
            studentsEnrolled: true,
        }).populate("instructor").exec();

        return res.status(200).json({
            success: true,
            message: "all courses fetched successfully",
            data: allCourses
        })

    }
    catch (err) {
        console.error(err);
        return res.status(500).json({
            success: false,
            message: "cannot fetch courses",
            error: err.message,
        })
    }
}

