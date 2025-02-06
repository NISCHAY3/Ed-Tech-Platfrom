const Category = require("../models/Category");

//creating Category
exports.createCategory = async (req, res) => {
    try {

        const { name, description } = req.body;
        if (!nmae || !description) {
            return res.status(400).json({
                success: false,
                message: "all fields required"
            })
        }

        const categoryDetails = await Category.create({
            name: name,
            description: description,
        });

        console.log(categoryDetails);

        return res.status(200).json({
            success: true,
            message: "Category created successfully",
        })



    }
    catch (err) {
        return res.status(500).json({
            success: false,
            message: err.message
        })
    }
}

//getAllCategory
exports.showAllCategories = async (req, res) => {
    try {
        const allCategories = await Category.find({}, { name: true, description: true });
        return res.status(200).json({
            success: true,
            message: "all Categories fetched successfully",
            allCategories
        })
    }
    catch (err) {
        return res.status(500).json({
            success: false,
            message: err.message
        })
    }
}
