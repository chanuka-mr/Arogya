const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");

const app = express();

// Routes
// 5001: appointment-service
app.use("/api/appointments", createProxyMiddleware({
    target: "http://localhost:5001",
    changeOrigin: true
}));

// 5002: doctor-service
app.use("/api/doctors", createProxyMiddleware({
    target: "http://localhost:5002",
    changeOrigin: true
}));

// 5003: medical-report-service
app.use("/api/medical-reports", createProxyMiddleware({
    target: "http://localhost:5003",
    changeOrigin: true
}));

// 5004: notification-service
app.use("/api/notifications", createProxyMiddleware({
    target: "http://localhost:5004",
    changeOrigin: true
}));

// 5005: patient-service
app.use("/api/patients", createProxyMiddleware({
    target: "http://localhost:5005",
    changeOrigin: true
}));

// 5006: payment-service
app.use("/api/payments", createProxyMiddleware({
    target: "http://localhost:5006",
    changeOrigin: true
}));

// 5007: telemedicine-service
app.use("/api/telemedicine", createProxyMiddleware({
    target: "http://localhost:5007",
    changeOrigin: true
}));

// 5008: user-service (auth handles)
app.use("/api/auth", createProxyMiddleware({
    target: "http://localhost:5008",
    changeOrigin: true
}));

app.listen(5000, () => {
    console.log("API Gateway running on port 5000");
});
