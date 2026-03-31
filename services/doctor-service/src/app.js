const express = require("express");
const cors = require("cors");
const path = require("path");

const doctorRoutes = require("./routes/doctorRoutes");
const { errorHandler, notFound } = require("./middleware/errorMiddleware");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
    res.status(200).json({
        service: "doctor-service",
        status: "ok",
        timestamp: new Date().toISOString()
    });
});

app.get("/openapi.yaml", (req, res) => {
    res.type("application/yaml");
    res.sendFile(path.join(__dirname, "..", "openapi.yaml"));
});

app.get("/api/doctors/docs", (req, res) => {
    res.type("application/yaml");
    res.sendFile(path.join(__dirname, "..", "openapi.yaml"));
});

app.use("/api/doctors", doctorRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
