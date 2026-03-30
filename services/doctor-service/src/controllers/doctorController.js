const Doctor = require("../models/Doctor");

const DAY_VALUES = [
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
    "sunday"
];

const STATUS_VALUES = ["active", "inactive", "on-leave"];
const MODE_VALUES = ["in-person", "online", "both"];

const asyncHandler = (handler) => async (req, res, next) => {
    try {
        await handler(req, res, next);
    } catch (error) {
        next(error);
    }
};

const createError = (message, statusCode) => {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
};

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const toArray = (value) => {
    if (Array.isArray(value)) {
        return value.map((item) => String(item).trim()).filter(Boolean);
    }

    if (typeof value === "string") {
        return value
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean);
    }

    return [];
};

const normalizeAvailability = (availability = []) =>
    availability
        .filter(Boolean)
        .map((slot) => ({
            dayOfWeek: String(slot.dayOfWeek || "").trim().toLowerCase(),
            startTime: String(slot.startTime || "").trim(),
            endTime: String(slot.endTime || "").trim(),
            mode: String(slot.mode || "in-person").trim().toLowerCase()
        }))
        .filter((slot) => slot.dayOfWeek && slot.startTime && slot.endTime);

const parseBoolean = (value) => {
    if (value === "true" || value === true) {
        return true;
    }

    if (value === "false" || value === false) {
        return false;
    }

    return undefined;
};

const parseNumber = (value) => {
    if (value === undefined || value === null || value === "") {
        return undefined;
    }

    const parsedValue = Number(value);
    return Number.isNaN(parsedValue) ? undefined : parsedValue;
};

const validateDoctorPayload = (payload, { isUpdate = false } = {}) => {
    const requiredFields = [
        "fullName",
        "email",
        "phone",
        "licenseNumber",
        "specialties",
        "consultationFee"
    ];

    if (!isUpdate) {
        const missingFields = requiredFields.filter((field) => {
            if (field === "specialties") {
                return !payload.specialties || payload.specialties.length === 0;
            }

            return payload[field] === undefined || payload[field] === null || payload[field] === "";
        });

        if (missingFields.length > 0) {
            throw createError(
                `Missing required field(s): ${missingFields.join(", ")}`,
                400
            );
        }
    }

    if (payload.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email)) {
        throw createError("A valid email address is required", 400);
    }

    if (payload.consultationFee !== undefined && payload.consultationFee < 0) {
        throw createError("Consultation fee cannot be negative", 400);
    }

    if (
        payload.yearsOfExperience !== undefined &&
        payload.yearsOfExperience < 0
    ) {
        throw createError("Years of experience cannot be negative", 400);
    }

    if (payload.status && !STATUS_VALUES.includes(payload.status)) {
        throw createError(
            `Status must be one of: ${STATUS_VALUES.join(", ")}`,
            400
        );
    }

    if (
        payload.availability &&
        payload.availability.some(
            (slot) =>
                !DAY_VALUES.includes(slot.dayOfWeek) ||
                !MODE_VALUES.includes(slot.mode)
        )
    ) {
        throw createError(
            "Availability entries must have a valid dayOfWeek and mode",
            400
        );
    }
};

const buildDoctorPayload = (body, { isUpdate = false } = {}) => {
    const payload = {};

    const stringFields = [
        "fullName",
        "email",
        "phone",
        "gender",
        "licenseNumber",
        "bio",
        "status"
    ];

    stringFields.forEach((field) => {
        if (body[field] !== undefined) {
            payload[field] = String(body[field]).trim();
        }
    });

    if (payload.email) {
        payload.email = payload.email.toLowerCase();
    }

    if (payload.status) {
        payload.status = payload.status.toLowerCase();
    }

    const specialties = toArray(body.specialties);
    if (specialties.length > 0 || (!isUpdate && body.specialties !== undefined)) {
        payload.specialties = specialties;
    }

    [
        "qualifications",
        "languages",
        "locations",
        "hospitalAffiliations"
    ].forEach((field) => {
        const items = toArray(body[field]);
        if (items.length > 0 || (!isUpdate && body[field] !== undefined)) {
            payload[field] = items;
        }
    });

    const yearsOfExperience = parseNumber(body.yearsOfExperience);
    if (yearsOfExperience !== undefined) {
        payload.yearsOfExperience = yearsOfExperience;
    }

    const consultationFee = parseNumber(body.consultationFee);
    if (consultationFee !== undefined) {
        payload.consultationFee = consultationFee;
    }

    const isAvailable = parseBoolean(body.isAvailable);
    if (isAvailable !== undefined) {
        payload.isAvailable = isAvailable;
    }

    if (body.availability !== undefined) {
        payload.availability = normalizeAvailability(body.availability);
    }

    validateDoctorPayload(payload, { isUpdate });
    return payload;
};

const buildDoctorFilters = (query) => {
    const filters = {};
    const andConditions = [];

    if (query.search) {
        const regex = new RegExp(escapeRegex(query.search.trim()), "i");
        andConditions.push({
            $or: [
                { fullName: regex },
                { specialties: regex },
                { qualifications: regex },
                { locations: regex },
                { hospitalAffiliations: regex }
            ]
        });
    }

    if (query.specialty) {
        andConditions.push({
            specialties: new RegExp(escapeRegex(query.specialty.trim()), "i")
        });
    }

    if (query.location) {
        andConditions.push({
            locations: new RegExp(escapeRegex(query.location.trim()), "i")
        });
    }

    if (query.status) {
        filters.status = query.status.trim().toLowerCase();
    }

    const isAvailable = parseBoolean(query.isAvailable);
    if (isAvailable !== undefined) {
        filters.isAvailable = isAvailable;
    }

    const minFee = parseNumber(query.minFee);
    const maxFee = parseNumber(query.maxFee);
    if (minFee !== undefined || maxFee !== undefined) {
        filters.consultationFee = {};

        if (minFee !== undefined) {
            filters.consultationFee.$gte = minFee;
        }

        if (maxFee !== undefined) {
            filters.consultationFee.$lte = maxFee;
        }
    }

    const minExperience = parseNumber(query.minExperience);
    if (minExperience !== undefined) {
        filters.yearsOfExperience = { $gte: minExperience };
    }

    if (query.availableDay) {
        filters["availability.dayOfWeek"] = query.availableDay.trim().toLowerCase();
    }

    if (query.mode) {
        filters["availability.mode"] = query.mode.trim().toLowerCase();
    }

    if (andConditions.length > 0) {
        filters.$and = andConditions;
    }

    return filters;
};

const getSortOption = (sortBy = "newest") => {
    const sortOptions = {
        newest: { createdAt: -1 },
        oldest: { createdAt: 1 },
        feeAsc: { consultationFee: 1 },
        feeDesc: { consultationFee: -1 },
        experienceDesc: { yearsOfExperience: -1 },
        nameAsc: { fullName: 1 }
    };

    return sortOptions[sortBy] || sortOptions.newest;
};

const createDoctor = asyncHandler(async (req, res) => {
    const payload = buildDoctorPayload(req.body);
    const doctor = await Doctor.create(payload);

    res.status(201).json({
        message: "Doctor profile created successfully",
        data: doctor
    });
});

const getDoctors = asyncHandler(async (req, res) => {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 50);
    const filters = buildDoctorFilters(req.query);
    const sort = getSortOption(req.query.sortBy);

    const [doctors, total] = await Promise.all([
        Doctor.find(filters)
            .sort(sort)
            .skip((page - 1) * limit)
            .limit(limit),
        Doctor.countDocuments(filters)
    ]);

    res.status(200).json({
        data: doctors,
        meta: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
        }
    });
});

const getDoctorById = asyncHandler(async (req, res) => {
    const doctor = await Doctor.findById(req.params.id);

    if (!doctor) {
        throw createError("Doctor not found", 404);
    }

    res.status(200).json({ data: doctor });
});

const updateDoctor = asyncHandler(async (req, res) => {
    const payload = buildDoctorPayload(req.body, { isUpdate: true });

    if (Object.keys(payload).length === 0) {
        throw createError("At least one valid field is required to update a doctor", 400);
    }

    const doctor = await Doctor.findByIdAndUpdate(req.params.id, payload, {
        new: true,
        runValidators: true
    });

    if (!doctor) {
        throw createError("Doctor not found", 404);
    }

    res.status(200).json({
        message: "Doctor profile updated successfully",
        data: doctor
    });
});

const updateDoctorStatus = asyncHandler(async (req, res) => {
    const status = String(req.body.status || "").trim().toLowerCase();

    if (!STATUS_VALUES.includes(status)) {
        throw createError(
            `Status must be one of: ${STATUS_VALUES.join(", ")}`,
            400
        );
    }

    const doctor = await Doctor.findByIdAndUpdate(
        req.params.id,
        { status, isAvailable: status === "active" },
        { new: true, runValidators: true }
    );

    if (!doctor) {
        throw createError("Doctor not found", 404);
    }

    res.status(200).json({
        message: "Doctor status updated successfully",
        data: doctor
    });
});

const updateDoctorAvailability = asyncHandler(async (req, res) => {
    const availability = normalizeAvailability(req.body.availability);

    if (availability.length === 0) {
        throw createError("A non-empty availability array is required", 400);
    }

    validateDoctorPayload({ availability }, { isUpdate: true });

    const doctor = await Doctor.findByIdAndUpdate(
        req.params.id,
        { availability },
        { new: true, runValidators: true }
    );

    if (!doctor) {
        throw createError("Doctor not found", 404);
    }

    res.status(200).json({
        message: "Doctor availability updated successfully",
        data: doctor
    });
});

const deleteDoctor = asyncHandler(async (req, res) => {
    const doctor = await Doctor.findByIdAndDelete(req.params.id);

    if (!doctor) {
        throw createError("Doctor not found", 404);
    }

    res.status(200).json({
        message: "Doctor profile deleted successfully"
    });
});

module.exports = {
    createDoctor,
    getDoctors,
    getDoctorById,
    updateDoctor,
    updateDoctorStatus,
    updateDoctorAvailability,
    deleteDoctor
};
