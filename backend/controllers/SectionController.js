const Section = require("../models/Section");
const Course = require("../models/Course");


exports.createSection = async (req, res) => {
    try {
        //data fetch

        const { sectionName, courseId } = req.body;

        //data validation
        if (!sectionName || !courseId) {
            return res.status(400).json({
                successs: false,
                message: "Missing Data"
            });
        }
        //create section
        const newSection = await Section.create({ sectionName });
        //update course
        const updateCourseDetails = await Course.findByIdAndUpdate(courseId,
            {
                $push: {
                    courseContent: newSection._id
                }
            }
            , { new: true });


        const updatedCourseDetails = await Course.findById(courseId)
            .populate({
                path: 'courseContent',
                populate: {
                    path: 'subSection'
                }

            })
        //return succesfull response

        return res.status(200).json({
            succes: ture,
            message: "section created successfully",
            updateCourseDetails
        })
    }

    catch (err) {
        console.error(err);

        return res.status(500).json({
            success: false,
            message: "error while creating section",
            error: err.message,
        })

    }
}

exports.updateSection = async (req, res) => {
    try {
        //data input 
        const { sectionName, sectionId } = req.body;
        //data validation
        if (!sectionName || !sectionId) {
            res.status(400).json({
                success: false,
                message: "invalid data"
            }
            )
        }
        //update data
        const section = await Section.findByIdAndUpdate(sectionId, { sectionName }, { new: true });
        //return response

        res.status(200).json({
            success: true,
            message: "section Updated Successfully"
        })

    }

    catch (err) {

        console.error(err);

        return res.status(500).json({
            success: false,
            message: "error while updating section",
            error: err.message,
        })


    }
}

exports.deleteSection = async (req, res) => {
    try {

        //data fetch(id)
        const { sectionId, courseId } = req.body;

        //use findById and Delete

        await Section.findByIdAndDelete(sectionId);
        const updatedCourseDetails = await Course.findById(courseId)
            .populate({
                path: 'courseContent',
                populate: {
                    path: 'subSection'
                }
            })



        //return response

        return res.status(200).json({
            success: true,
            message: "Section Deleted Successfulyy"
        })

    }
    catch (err) {
        console.error(err);

        return res.status(500).json({
            success: false,
            message: "error while Deleting section",
            error: err.message,
        })

    }
}


