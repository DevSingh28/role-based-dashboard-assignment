import express from "express";
import { GetCurrentUser, LoginUser, LogoutUser, RegisterUser } from "../controllers/auth.controller.js";
import { protect } from "../middlewares/protect.js";

const router = express.Router();


router.post("/register", RegisterUser);

router.post("/login", LoginUser);

router.get("/me", protect, GetCurrentUser);

router.post("/logout", LogoutUser);


export default router;