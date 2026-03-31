const jwt = require("jsonwebtoken");

const extractBearerToken = (authorizationHeader = "") => {
    if (!authorizationHeader.startsWith("Bearer ")) {
        return null;
    }

    return authorizationHeader.split(" ")[1];
};

const authenticate = (req, res, next) => {
    const token = extractBearerToken(req.headers.authorization);

    if (!token) {
        return res.status(401).json({
            message: "Authentication token is required"
        });
    }

    if (!process.env.JWT_SECRET) {
        return res.status(500).json({
            message: "JWT_SECRET is not configured"
        });
    }

    try {
        req.user = jwt.verify(token, process.env.JWT_SECRET);
        return next();
    } catch (error) {
        return res.status(401).json({
            message: "Invalid or expired authentication token"
        });
    }
};

const authorize = (...allowedRoles) => (req, res, next) => {
    const roles = Array.isArray(req.user?.roles)
        ? req.user.roles
        : req.user?.role
            ? [req.user.role]
            : [];

    const hasAccess = roles.some((role) => allowedRoles.includes(role));

    if (!hasAccess) {
        return res.status(403).json({
            message: "You do not have permission to perform this action"
        });
    }

    return next();
};

module.exports = {
    authenticate,
    authorize
};
