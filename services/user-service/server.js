const express = require("express");
const connectDB = require("./src/config/db");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", require("./src/routes/authRoutes"));

connectDB();

app.listen(process.env.PORT, () => {
    console.log(`Auth Service running on port ${process.env.PORT}`);
});
