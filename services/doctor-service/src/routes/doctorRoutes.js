const express = require("express");
const {
    createDoctor,
    getDoctors,
    getDoctorById,
    updateDoctor,
    updateDoctorStatus,
    updateDoctorAvailability,
    deleteDoctor
} = require("../controllers/doctorController");
const validateObjectId = require("../middleware/validateObjectId");

const router = express.Router();

router.get("/health", (req, res) => {
    res.status(200).json({
        service: "doctor-service",
        status: "ok",
        timestamp: new Date().toISOString()
    });
});

router.route("/")
    .post(createDoctor)
    .get(getDoctors);

router.patch("/:id/status", validateObjectId, updateDoctorStatus);
router.patch("/:id/availability", validateObjectId, updateDoctorAvailability);

router.route("/:id")
    .get(validateObjectId, getDoctorById)
    .put(validateObjectId, updateDoctor)
    .delete(validateObjectId, deleteDoctor);

module.exports = router;
