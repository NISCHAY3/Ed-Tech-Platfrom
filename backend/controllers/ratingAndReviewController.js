const RatingAndReview = require("../models/RatingAndReview");
const Course = require("../models/Course");


//create rating

exports.createRating = async (req, res) => {
    try {
        //get userId 

        const userId = req.user.id;


        //fetch adta from req body
        const { rating, review, courseId } = req.body;
        //check if user is enrolled or not

        const courseDetails = await Course.findOne(
            {
                _id: courseId,
                studentsEnrolled: { $elemMatch: { $eq: userId } },
            }
        )

        if (!courseDetails) {
            return res.status(404).json({
                success: false,
                message: "student is not enrolled in the course"
            })
        }



        //check if user has already put review or not 
        const alreadyReviewed = await RatingAndReview.findOne({
            user: userId,
            course: courseId
        })

        if (alreadyReviewed) {
            return res.status(403).json({
                success: false,
                message: "already reviewd by this user"
            })
        }
        //create rating 
        const ratingReview = await RatingAndReview.create({

            rating, review
            , course: courseId,
            user: userId

        })

        //update Course model also with this rating and review
        const updatedCourseDetails = await Course.findByIdAndUpdate({ _id: courseId }, {
            $push: {
                ratingAndReviews: ratingReview._id
            }
        }
            , { new: true });


        //return response

        return res.status(200).json({
            success: true,
            message: "rating and review created"
        })


    }

    catch (err) {
        console.log(err);

        return res.status(500).json({
            success: false,
            message: err.message
        })

    }
}

//get Average Rating


exports.getAverageRating = async (req, res) => {
    try {
        //get course ID
        const courseId = req.body.courseId;
        //calculate avg rating

        const result = await RatingAndReview.aggregate([
            {
                $match: {
                    course: new mongoose.Types.ObjectId(courseId),
                },
            },
            {
                $group: {
                    _id: null,
                    averageRating: { $avg: "$rating" },
                }
            }
        ])

        //return rating
        if (result.length > 0) {

            return res.status(200).json({
                success: true,
                averageRating: result[0].averageRating,
            })

        }

        //if no rating/Review exist
        return res.status(200).json({
            success: true,
            message: 'Average Rating is 0, no ratings given till now',
            averageRating: 0,
        })
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: error.message,
        })
    }
}





//get All Rating

exports.getAllRatingReview = async (req, res) => {
    try {
        const allReviews = await RatingAndReview.find({})
            .sort({ rating: 'desc' })
            .populate({
                path: 'user',
                select: 'firstName lastName email image'
            })
            .populate({
                path: 'course',
                select: 'courseName'
            })
            .exec();

        return res.status(200).json({
            success: true,
            data: allReviews,
            message: "All reviews fetched successfully"
        });
    }
    catch (error) {
        console.log('Error while fetching all ratings');
        console.log(error);
        return res.status(500).json({
            success: false,
            error: error.message,
            message: 'Error while fetching all ratings',
        })
    }
}