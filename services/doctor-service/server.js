const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./src/config/db");
const doctorRoutes = require("./src/routes/doctorRoutes");
const { errorHandler, notFound } = require("./src/middleware/errorMiddleware");

const app = express();
const PORT = process.env.PORT || 5002;

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
    res.status(200).json({
        service: "doctor-service",
        status: "ok",
        timestamp: new Date().toISOString()
    });
});

app.use("/api/doctors", doctorRoutes);

app.use(notFound);
app.use(errorHandler);

const startServer = async () => {
    try {
        await connectDB();
        app.listen(PORT, () => {
            console.log(`Doctor Service running on port ${PORT}`);
        });
    } catch (error) {
        console.error("Failed to start doctor service:", error.message);
        process.exit(1);
    }
};

startServer();

module.exports = app;
