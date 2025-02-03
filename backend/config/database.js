const mongoose = require('mongoose');
require('dotenv').config();

exports.connectDB = () => {
    mongoose.connect(process.env.MONGO_URL)
        .then(() => {
            console.log("DB connected Successfully");
        })
        .catch((err) => {
            console.error(err)
            console.log("DB not connected");
            process.exit(1);
        })
}