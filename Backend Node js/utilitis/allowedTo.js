const apperror = require("../utilitis/AppError")
module.exports = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.Role)) {
            return next(apperror.create(401, "Unauthorized !"))
        }
        next();
    }
}