import express from "express";
import { GetDashboardInsights, GetRevenueByCategory } from "../controllers/dashboard.controller.js";
import { protect } from "../middlewares/protect.js";

const router = express.Router();

router.get("/revenue", protect, GetRevenueByCategory);
router.get("/insights", protect, GetDashboardInsights);

export default router;