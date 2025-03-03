const { instance } = require("../config/razorpay");
const Course = require("../models/Course");
const User = require("../models/User");
const mailSender = require("../utils/mailSender");
const { courseEnrollmentEmail } = require("../mail/templates/courseEnrollmentEmail");




//capture the payment and initiate the razorpay order

exports.capturePayment = async (req, res) => {


    //get course id and user id 
    const { course_id } = req.body;
    const userId = req.user.id;
    //validation

    if (!course_id) {
        return res.status(403).json({
            success: fasle,
            message: "please provide valid courseId"
        })
    };

    //valid course id 
    //valid course detail
    let course;
    try {

        course = await Course.findById(course_id);

        if (!course) {
            return res.json({
                success: false,
                message: "couldnot find the course"
            })
        }

        //user already paid for the same course

        const uid = new mongooese.Types.ObjectId(userId);
        if (course.studentsEnrolled.includes(uid)) {
            return res.status(200).json({
                success: false,
                message: "student is already enrolled"
            })
        }
    }

    catch (err) {

        console.error(err);
        return res.status(500).json({
            success: fasle,
            message: err.message
        })

    }


    // order created and return resposnse

    const amount = course.price;
    const currency = "INR";

    const options = {

        amount: amount * 100,
        currency,
        recipt: Math.random(Date.now()).toString(),
        notes: {
            courseId: course_id,
            userId,
        }

    };

    try {

        //initiate the payment using razorpay
        const paymentResponse = await instance.orders.create(options);
        console.log(paymentResponse);

        return res.status(200).json({
            success: true,
            // message: "oayment successful",
            courseName: course.courseName,
            courseDecription: course.courseDescription,
            thumbnail: course.thumbnail,
            orderId: paymentResponse.id,
            currency: paymentResponse.currency,
            amount: paymentResponse.amount,


        })

    }
    catch (err) {

        console.log(err);
        res.josn({

            success: false,
            message: "could not initiate the order "

        })

    }

}



//verify signature

exports.verifySignature = async (req, res) => {

    const webhookSecret = "12345678";
    const signature = req.headers["x-razorpay-signature"];

    const shasum = crypto.createHmac("sha256", webhookSecret);
    shasum.update(JSON.stringify(req.body));
    const digest = shasum.digest("hex");

    if (signature === digest) {
        console.log("payment is authorized");
        const { courseId, userId } = req.body.payload.entity.notes;

        try {
            //fulfill the action by enrolling student

            const enrolledCourse = await Course.findOneAndUpdate(
                { _id: courseId },
                {
                    $push: { studentsEnrolled: userId }
                },
                { new: true }
            );

            if (!enrolledCourse) {
                return res.status(500).json({
                    success: false,
                    message: "course not found"
                })
            }

            console.log(enrolledCourse);

            //find the student and add the course to their enrolled courses 

            const enrolledStudent = await User.findOneAndUpdate(
                { _id: userId },
                { $push: { courses: courseId } },
                { new: true },
            );

            console.log(enrolledStudent);

            //mail send

            const emailResponse = await mailSender(
                enrolledStudent.email,
                "congratulations",
                "Congratulations on joining"

            )

            console.log(emailResponse);

            return res.status(200).json({
                success: true,
                message: "Course enrolled successful"
            })



        }

        catch (err) {
            console.log(err);
            return res.status(500).json({
                success: fasle,
                message: err.message
            })
        }

    }

    else {
        return res.status(400).json({
            success: false,
            message: "signature not matched"
        })
    }

}
