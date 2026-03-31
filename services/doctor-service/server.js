require("dotenv").config();

const connectDB = require("./src/config/db");
const app = require("./src/app");
const PORT = process.env.PORT || 5002;

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
