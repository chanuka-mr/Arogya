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
const SORT_VALUES = [
    "newest",
    "oldest",
    "feeAsc",
    "feeDesc",
    "experienceDesc",
    "experienceAsc",
    "nameAsc"
];

const MANAGEMENT_ROLES = ["admin", "doctor-manager"];
const INTEGRATION_ROLES = ["admin", "doctor-manager", "service"];
const TIME_REGEX = /^([01]\d|2[0-3]):([0-5]\d)$/;

module.exports = {
    DAY_VALUES,
    STATUS_VALUES,
    MODE_VALUES,
    SORT_VALUES,
    MANAGEMENT_ROLES,
    INTEGRATION_ROLES,
    TIME_REGEX
};
