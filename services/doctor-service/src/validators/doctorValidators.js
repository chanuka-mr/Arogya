const { body, param, query } = require("express-validator");
const {
    DAY_VALUES,
    STATUS_VALUES,
    MODE_VALUES,
    SORT_VALUES,
    TIME_REGEX
} = require("../constants/doctorConstants");

const parseOptionalArray = (value) => {
    if (Array.isArray(value)) {
        return value;
    }

    if (typeof value === "string") {
        return value
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean);
    }

    return value;
};

const validateAvailabilitySlots = body("availability")
    .optional()
    .custom((availability) => {
        if (!Array.isArray(availability) || availability.length === 0) {
            throw new Error("availability must be a non-empty array");
        }

        availability.forEach((slot) => {
            if (!DAY_VALUES.includes(String(slot.dayOfWeek || "").trim().toLowerCase())) {
                throw new Error(`dayOfWeek must be one of: ${DAY_VALUES.join(", ")}`);
            }

            if (!TIME_REGEX.test(String(slot.startTime || ""))) {
                throw new Error("startTime must use HH:mm format");
            }

            if (!TIME_REGEX.test(String(slot.endTime || ""))) {
                throw new Error("endTime must use HH:mm format");
            }

            if (String(slot.startTime) >= String(slot.endTime)) {
                throw new Error("availability endTime must be later than startTime");
            }

            if (!MODE_VALUES.includes(String(slot.mode || "").trim().toLowerCase())) {
                throw new Error(`mode must be one of: ${MODE_VALUES.join(", ")}`);
            }
        });

        return true;
    });

const commonDoctorValidators = [
    body("fullName")
        .optional({ values: "falsy" })
        .trim()
        .isLength({ min: 3, max: 120 })
        .withMessage("fullName must be between 3 and 120 characters"),
    body("email")
        .optional({ values: "falsy" })
        .trim()
        .isEmail()
        .withMessage("A valid email address is required"),
    body("phone")
        .optional({ values: "falsy" })
        .trim()
        .matches(/^[0-9+\-\s()]{7,20}$/)
        .withMessage("A valid phone number is required"),
    body("licenseNumber")
        .optional({ values: "falsy" })
        .trim()
        .isLength({ min: 4, max: 60 })
        .withMessage("licenseNumber must be between 4 and 60 characters"),
    body("gender")
        .optional({ values: "falsy" })
        .trim()
        .isLength({ min: 2, max: 20 })
        .withMessage("gender must be between 2 and 20 characters"),
    body("consultationFee")
        .optional()
        .isFloat({ min: 0 })
        .withMessage("consultationFee must be a positive number or zero"),
    body("yearsOfExperience")
        .optional()
        .isInt({ min: 0 })
        .withMessage("yearsOfExperience must be a positive integer or zero"),
    body("isAvailable")
        .optional()
        .isBoolean()
        .withMessage("isAvailable must be true or false"),
    body("status")
        .optional({ values: "falsy" })
        .trim()
        .toLowerCase()
        .isIn(STATUS_VALUES)
        .withMessage(`status must be one of: ${STATUS_VALUES.join(", ")}`),
    body("bio")
        .optional({ values: "falsy" })
        .trim()
        .isLength({ max: 1000 })
        .withMessage("bio cannot be longer than 1000 characters"),
    body("specialties")
        .optional()
        .customSanitizer(parseOptionalArray)
        .isArray({ min: 1 })
        .withMessage("specialties must be a non-empty array"),
    body("specialties.*")
        .optional()
        .trim()
        .notEmpty()
        .withMessage("specialties cannot contain empty values"),
    body("qualifications")
        .optional()
        .customSanitizer(parseOptionalArray)
        .isArray()
        .withMessage("qualifications must be an array"),
    body("qualifications.*")
        .optional()
        .trim()
        .notEmpty()
        .withMessage("qualifications cannot contain empty values"),
    body("languages")
        .optional()
        .customSanitizer(parseOptionalArray)
        .isArray()
        .withMessage("languages must be an array"),
    body("languages.*")
        .optional()
        .trim()
        .notEmpty()
        .withMessage("languages cannot contain empty values"),
    body("locations")
        .optional()
        .customSanitizer(parseOptionalArray)
        .isArray()
        .withMessage("locations must be an array"),
    body("locations.*")
        .optional()
        .trim()
        .notEmpty()
        .withMessage("locations cannot contain empty values"),
    body("hospitalAffiliations")
        .optional()
        .customSanitizer(parseOptionalArray)
        .isArray()
        .withMessage("hospitalAffiliations must be an array"),
    body("hospitalAffiliations.*")
        .optional()
        .trim()
        .notEmpty()
        .withMessage("hospitalAffiliations cannot contain empty values"),
    validateAvailabilitySlots
];

const validateCreateDoctor = [
    body("fullName")
        .exists({ checkFalsy: true })
        .withMessage("fullName is required"),
    body("email")
        .exists({ checkFalsy: true })
        .withMessage("email is required"),
    body("phone")
        .exists({ checkFalsy: true })
        .withMessage("phone is required"),
    body("licenseNumber")
        .exists({ checkFalsy: true })
        .withMessage("licenseNumber is required"),
    body("specialties")
        .exists()
        .withMessage("specialties is required"),
    body("consultationFee")
        .exists({ checkFalsy: true })
        .withMessage("consultationFee is required"),
    ...commonDoctorValidators
];

const validateUpdateDoctor = commonDoctorValidators;

const validateDoctorStatus = [
    body("status")
        .exists({ checkFalsy: true })
        .withMessage("status is required")
        .trim()
        .toLowerCase()
        .isIn(STATUS_VALUES)
        .withMessage(`status must be one of: ${STATUS_VALUES.join(", ")}`)
];

const validateDoctorAvailability = [
    body("availability")
        .exists()
        .withMessage("availability is required"),
    validateAvailabilitySlots
];

const validateDoctorQuery = [
    query("status")
        .optional()
        .trim()
        .toLowerCase()
        .isIn(STATUS_VALUES)
        .withMessage(`status must be one of: ${STATUS_VALUES.join(", ")}`),
    query("isAvailable")
        .optional()
        .isBoolean()
        .withMessage("isAvailable must be true or false"),
    query("minFee")
        .optional()
        .isFloat({ min: 0 })
        .withMessage("minFee must be a positive number or zero"),
    query("maxFee")
        .optional()
        .isFloat({ min: 0 })
        .withMessage("maxFee must be a positive number or zero"),
    query("minExperience")
        .optional()
        .isInt({ min: 0 })
        .withMessage("minExperience must be a positive integer or zero"),
    query("availableDay")
        .optional()
        .trim()
        .toLowerCase()
        .isIn(DAY_VALUES)
        .withMessage(`availableDay must be one of: ${DAY_VALUES.join(", ")}`),
    query("mode")
        .optional()
        .trim()
        .toLowerCase()
        .isIn(MODE_VALUES)
        .withMessage(`mode must be one of: ${MODE_VALUES.join(", ")}`),
    query("sortBy")
        .optional()
        .isIn(SORT_VALUES)
        .withMessage(`sortBy must be one of: ${SORT_VALUES.join(", ")}`),
    query("page")
        .optional()
        .isInt({ min: 1 })
        .withMessage("page must be a positive integer"),
    query("limit")
        .optional()
        .isInt({ min: 1, max: 50 })
        .withMessage("limit must be between 1 and 50"),
    query()
        .custom((_, { req }) => {
            if (
                req.query.minFee !== undefined &&
                req.query.maxFee !== undefined &&
                Number(req.query.minFee) > Number(req.query.maxFee)
            ) {
                throw new Error("minFee cannot be greater than maxFee");
            }

            return true;
        })
];

const validateAvailabilityCheck = [
    body("dayOfWeek")
        .exists({ checkFalsy: true })
        .withMessage("dayOfWeek is required")
        .trim()
        .toLowerCase()
        .isIn(DAY_VALUES)
        .withMessage(`dayOfWeek must be one of: ${DAY_VALUES.join(", ")}`),
    body("startTime")
        .exists({ checkFalsy: true })
        .withMessage("startTime is required")
        .matches(TIME_REGEX)
        .withMessage("startTime must use HH:mm format"),
    body("endTime")
        .exists({ checkFalsy: true })
        .withMessage("endTime is required")
        .matches(TIME_REGEX)
        .withMessage("endTime must use HH:mm format"),
    body("mode")
        .optional()
        .trim()
        .toLowerCase()
        .isIn(MODE_VALUES)
        .withMessage(`mode must be one of: ${MODE_VALUES.join(", ")}`),
    body()
        .custom((_, { req }) => {
            if (
                TIME_REGEX.test(req.body.startTime || "") &&
                TIME_REGEX.test(req.body.endTime || "") &&
                req.body.startTime >= req.body.endTime
            ) {
                throw new Error("endTime must be later than startTime");
            }

            return true;
        })
];

const validateDoctorIdParam = [
    param("id")
        .isMongoId()
        .withMessage("Invalid doctor id")
];

module.exports = {
    validateCreateDoctor,
    validateUpdateDoctor,
    validateDoctorStatus,
    validateDoctorAvailability,
    validateDoctorQuery,
    validateAvailabilityCheck,
    validateDoctorIdParam
};
