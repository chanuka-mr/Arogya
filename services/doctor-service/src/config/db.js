const mongoose = require("mongoose");

const connectDB = async () => {
    const { MONGO_URI, MONGO_DB_NAME } = process.env;

    if (!MONGO_URI) {
        throw new Error("MONGO_URI is not configured");
    }

    await mongoose.connect(MONGO_URI, {
        dbName: MONGO_DB_NAME || "doctor-service"
    });

    console.log("Doctor service connected to MongoDB");
};

module.exports = connectDB;
