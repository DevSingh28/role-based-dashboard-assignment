import pool from "../db/dbconnect.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../middlewares/createCookie.js";
import { allowedRoles } from "../utilities/allowedRoles.js";


export const RegisterUser = async (req, res) => {

    const { email, password, role, region } = req.body;


    if (!email || !password || !role) {
        return res.status(400).json({
            message: "Email, password and role are required!"
        });
    }



    if (!allowedRoles.includes(role)) {
        return res.status(400).json({
            message: "Invalid role!"
        });
    }


    if (role === "north_manager" && region !== "North") {
        return res.status(400).json({
            message: "North Manager must belong to North region!"
        });
    }

    if (role === "south_manager" && region !== "South") {
        return res.status(400).json({
            message: "South Manager must belong to South region!"
        });
    }


    const userRegion = role === "admin" ? null : region;


    try {



        const existingUser = await pool.query(
            `
            SELECT id
            FROM users
            WHERE email = $1
            `,
            [email]
        );

        if (existingUser.rows.length > 0) {
            return res.status(409).json({
                message: "User with this email already exists!"
            });
        }


        const hashedPassword = await bcrypt.hash(
            password,
            12
        );

        const result = await pool.query(
            `
            INSERT INTO users (
                email,
                password,
                role,
                region
            )
            VALUES ($1, $2, $3, $4)
            RETURNING id, email, role, region
            `,
            [
                email,
                hashedPassword,
                role,
                userRegion
            ]
        );


        const user = result.rows[0];


        const token = generateToken(user);


        res.cookie("sign_token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
            maxAge: 24 * 60 * 60 * 1000
        });


        return res.status(201).json({
            message: "Account created successfully!",
            user
        });

    } catch (error) {

        console.error("[Registration Error]:", error);

        return res.status(500).json({
            message: "Internal Server Error!"
        });
    }
};


export const LoginUser = async (req, res) => {

    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            message: "Email and password are required!"
        });
    }


    try {


        const result = await pool.query(
            `
            SELECT
                id,
                email,
                password,
                role,
                region
            FROM users
            WHERE email = $1
            `,
            [email]
        );


        if (result.rows.length === 0) {
            return res.status(401).json({
                message: "User not exist!"
            });
        }


        const user = result.rows[0];


        const isPasswordCorrect = await bcrypt.compare(
            password,
            user.password
        );


        if (!isPasswordCorrect) {
            return res.status(401).json({
                message: "Invalid password!"
            });
        }


        const token = generateToken(user);

        res.cookie("sign_token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
            maxAge: 24 * 60 * 60 * 1000
        });


        return res.status(200).json({
            message: "Login successful!",
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
                region: user.region
            }
        });

    } catch (error) {

        console.error("[Login Error]:", error);

        return res.status(500).json({
            message: "Internal Server Error!"
        });
    }
};

export const GetCurrentUser = async (req, res) => {
    return res.status(200).json({
        user: {
            id: req.user.id,
            email: req.user.email,
            role: req.user.role,
            region: req.user.region
        }
    });
};

export const LogoutUser = (req, res) => {

    res.clearCookie("sign_token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
    });


    return res.status(200).json({
        message: "Logout successful!"
    });
};