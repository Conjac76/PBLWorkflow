export const parseBody = (schema, req, res) => {
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
        res.status(400).json({
            error: "Validation failed",
            issues: parsed.error.flatten(),
        });
        return null;
    }
    return parsed.data;
};
