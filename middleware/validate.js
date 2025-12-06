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

export function validateQuery(schema) {
    return (req, res, next) => {
        const { error } = schema.validate(req.query);
        if (error) {
            return res.status(400).json({
                error: "Invalid query parameters",
                details: error.details[0].message,
            });
        }
        next();
    };
}
