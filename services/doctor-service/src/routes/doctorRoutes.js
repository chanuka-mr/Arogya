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

router.patch("/:id/status", updateDoctorStatus);
router.patch("/:id/availability", updateDoctorAvailability);

router.route("/:id")
    .get(getDoctorById)
    .put(updateDoctor)
    .delete(deleteDoctor);

module.exports = router;
