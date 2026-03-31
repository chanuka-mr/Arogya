const mongoose = require("mongoose");
const {
    DAY_VALUES,
    MODE_VALUES,
    STATUS_VALUES
} = require("../constants/doctorConstants");

const availabilitySchema = new mongoose.Schema(
    {
        dayOfWeek: {
            type: String,
            required: true,
            lowercase: true,
            enum: DAY_VALUES
        },
        startTime: {
            type: String,
            required: true,
            trim: true
        },
        endTime: {
            type: String,
            required: true,
            trim: true
        },
        mode: {
            type: String,
            required: true,
            lowercase: true,
            enum: MODE_VALUES,
            default: "in-person"
        }
    },
    { _id: false }
);

const doctorSchema = new mongoose.Schema(
    {
        fullName: {
            type: String,
            required: [true, "Doctor full name is required"],
            trim: true
        },
        email: {
            type: String,
            required: [true, "Doctor email is required"],
            unique: true,
            lowercase: true,
            trim: true
        },
        phone: {
            type: String,
            required: [true, "Doctor phone number is required"],
            trim: true
        },
        gender: {
            type: String,
            trim: true
        },
        licenseNumber: {
            type: String,
            required: [true, "Medical license number is required"],
            unique: true,
            trim: true
        },
        specialties: {
            type: [String],
            required: [true, "At least one specialty is required"],
            default: []
        },
        qualifications: {
            type: [String],
            default: []
        },
        yearsOfExperience: {
            type: Number,
            min: [0, "Years of experience cannot be negative"],
            default: 0
        },
        consultationFee: {
            type: Number,
            required: [true, "Consultation fee is required"],
            min: [0, "Consultation fee cannot be negative"]
        },
        languages: {
            type: [String],
            default: []
        },
        locations: {
            type: [String],
            default: []
        },
        hospitalAffiliations: {
            type: [String],
            default: []
        },
        bio: {
            type: String,
            trim: true,
            maxlength: [1000, "Bio cannot be longer than 1000 characters"]
        },
        isAvailable: {
            type: Boolean,
            default: true
        },
        status: {
            type: String,
            lowercase: true,
            enum: STATUS_VALUES,
            default: "active"
        },
        availability: {
            type: [availabilitySchema],
            default: []
        }
    },
    {
        timestamps: true,
        versionKey: false
    }
);

doctorSchema.index({ fullName: 1, email: 1 });
doctorSchema.index({ specialties: 1 });
doctorSchema.index({ locations: 1 });
doctorSchema.index({ status: 1 });
doctorSchema.index({ consultationFee: 1 });
doctorSchema.index({ yearsOfExperience: -1 });

module.exports = mongoose.model("Doctor", doctorSchema);
