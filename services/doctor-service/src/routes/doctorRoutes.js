const express = require("express");
const {
    createDoctor,
    getDoctors,
    getDoctorById,
    updateDoctor,
    updateDoctorStatus,
    updateDoctorAvailability,
    deleteDoctor,
    getDoctorSummary,
    checkDoctorAvailability
} = require("../controllers/doctorController");
const { authenticate, authorize } = require("../middleware/authMiddleware");
const handleValidationErrors = require("../middleware/validationMiddleware");
const {
    validateCreateDoctor,
    validateUpdateDoctor,
    validateDoctorStatus,
    validateDoctorAvailability,
    validateDoctorQuery,
    validateAvailabilityCheck,
    validateDoctorIdParam
} = require("../validators/doctorValidators");
const {
    MANAGEMENT_ROLES,
    INTEGRATION_ROLES
} = require("../constants/doctorConstants");

const router = express.Router();

router.get("/health", (req, res) => {
    res.status(200).json({
        service: "doctor-service",
        status: "ok",
        timestamp: new Date().toISOString()
    });
});

router.route("/")
    .post(
        authenticate,
        authorize(...MANAGEMENT_ROLES),
        validateCreateDoctor,
        handleValidationErrors,
        createDoctor
    )
    .get(validateDoctorQuery, handleValidationErrors, getDoctors);

router.get(
    "/:id/summary",
    authenticate,
    authorize(...INTEGRATION_ROLES),
    validateDoctorIdParam,
    handleValidationErrors,
    getDoctorSummary
);

router.post(
    "/:id/availability/check",
    authenticate,
    authorize(...INTEGRATION_ROLES),
    validateDoctorIdParam,
    validateAvailabilityCheck,
    handleValidationErrors,
    checkDoctorAvailability
);

router.patch(
    "/:id/status",
    authenticate,
    authorize(...MANAGEMENT_ROLES),
    validateDoctorIdParam,
    validateDoctorStatus,
    handleValidationErrors,
    updateDoctorStatus
);

router.patch(
    "/:id/availability",
    authenticate,
    authorize(...MANAGEMENT_ROLES),
    validateDoctorIdParam,
    validateDoctorAvailability,
    handleValidationErrors,
    updateDoctorAvailability
);

router.route("/:id")
    .get(validateDoctorIdParam, handleValidationErrors, getDoctorById)
    .put(
        authenticate,
        authorize(...MANAGEMENT_ROLES),
        validateDoctorIdParam,
        validateUpdateDoctor,
        handleValidationErrors,
        updateDoctor
    )
    .delete(
        authenticate,
        authorize(...MANAGEMENT_ROLES),
        validateDoctorIdParam,
        handleValidationErrors,
        deleteDoctor
    );

module.exports = router;
