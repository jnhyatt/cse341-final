export function validate(schema) {
    return (req, res, next) => {
        const { error } = schema.validate(req.body);
        if (error) {
            return res.status(400).json({
                error: "Validation error",
                details: error.details[0].message,
            });
        }
        next();
    };
}

export function validateParams(schema) {
    return (req, res, next) => {
        const { error } = schema.validate(req.params);
        if (error) {
            return res.status(400).json({
                error: "Invalid parameters",
                details: error.details[0].message,
            });
        }
        next();
    };
}

// Validates query parameters and applies defaults. Note that req.query is read-only, so we store
// validated values in req.validatedQuery. Controllers must use req.validatedQuery when this
// middleware is applied or default values will not be applied properly.
export function validateQuery(schema) {
    return (req, res, next) => {
        const { error, value } = schema.validate(req.query);
        if (error) {
            return res.status(400).json({
                error: "Invalid query parameters",
                details: error.details[0].message,
            });
        }
        req.validatedQuery = value;
        next();
    };
}
