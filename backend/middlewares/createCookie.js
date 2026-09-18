import "dotenv/config";
import jwt from "jsonwebtoken";

export const generateToken = (user) => {

    const payload = {
        id: user.id,
        email: user.email,
        role: user.role,
        region: user.region
    };

    return jwt.sign(
        payload,
        process.env.JWT_TOKEN_SECRET,
        {
            expiresIn: "1d"
        }
    );
};