import "dotenv/config";
import jwt from "jsonwebtoken";

export const protect = (req, res, next) => {
    try {
        const token = req.cookies?.sign_token;

        if (!token) {
            return res.status(401).json({
                message: "Authentication required!"
            });
        }

        const decoded = jwt.verify(
            token,
            process.env.JWT_TOKEN_SECRET
        );

        req.user = decoded;

        next();

    } catch (error) {
        return res.status(401).json({
            message: "Invalid or expired authentication token!"
        });
    }
};