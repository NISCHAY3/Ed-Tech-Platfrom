const Tag = require("../models/Tags");

//creating tag
exports.createTag = async (req, res) => {
    try {

        const { name, description } = req.body;
        if (!nmae || !description) {
            return res.status(400).json({
                success: false,
                message: "all fields required"
            })
        }

        const tagDetails = await Tag.create({
            name: name,
            description: description,
        });

        console.log(tagDetails);

        return res.status(200).json({
            success: true,
            message: "tag created successfully",
        })



    }
    catch (err) {
        return res.status(500).json({
            success: false,
            message: err.message
        })
    }
}

//getAllTags
exports.showAllTags = async (req, res) => {
    try {
        const allTags = await Tag.find({}, { name: true, description: true });
        return res.status(200).json({
            success: true,
            message: "all tags fetched successfully",
            allTags
        })
    }
    catch (err) {
        return res.status(500).json({
            success: false,
            message: err.message
        })
    }
}
