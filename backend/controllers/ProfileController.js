const Profile = require("../models/Profile");
const User = require("../models/User");
const Course = require("../models/Course")

exports.updateProfile = async (req, res) => {
    try {

        //fetch data user id
        const { dateOfBirth = "", about = "", contactNumber, gender } = req.body;
        const id = req.user.id;
        //data validation
        if (!id || !contactNumber || !gender) {
            return res.status(400).json({
                success: true,
                message: "data invalid"
            })
        }
        // find the profile 
        const userDetails = await User.findById(id);
        const profileId = userDetails.additionalDetails;
        const profileDetails = await Profile.findById(profileId);

        //update the profile
        profileDetails.dateOfBirth = dateOfBirth;
        profileDetails.about = about;
        profileDetails.gender = gender;
        profileDetails.contactNumber = contactNumber;
        await profileDetails.save();
        //return response

        return res.status(200).json({
            success: true,
            message: "profile updated successfully",
            profileDetails,
        })

    }

    catch (err) {

        console.error(err);

        return res.status(500).json({
            success: fasle,
            message: "profile updation failed"
        })


    }
}

exports.deleteAccount = async (req, res) => {
    try {


        //get id;
        const id = req.user.id;
        //validation
        const userDetails = await User.findById(id);

        if (!userDetails) {
            return res.status(400).json({
                success: false,
                message: "user not found"
            })
        }

        //delete profile

        const userEnrolledCoursesId = userDetails.courses
        // console.log('userEnrolledCourses ids = ', userEnrolledCoursesId)

        for (const courseId of userEnrolledCoursesId) {
            await Course.findByIdAndUpdate(courseId, {
                $pull: { studentsEnrolled: id }
            })
        }


        await Profile.findByIdAndDelete({ _id: userDetails.additionalDetails });

        //delete user
        await User.findByIdAndDelete({ _id: id });
        //return response

        return res.status(200).json({
            success: true,
            message: "account deleted successfully"
        })
    }

    catch (err) {
        console.error(err);

        return res.status(500).json({
            success: false,
            message: "account deletion failed try again later"
        })
    }

}

exports.getAllUserDetails = async (req, res) => {
    try {

        const id = req.user.id;

        const userDetails = await User.findById(id).populate("additionalDetails").exec();

        return res.status(200).json({
            success: true,
            message: "User details fetched successfully"
        })

    }

    catch (err) {
        console.error(err);
        return res.status(500).json({
            success: false,
            message: "cannot get  user detials try again later",
        })
    }
}
