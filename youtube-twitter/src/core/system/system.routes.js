import { Router } from "express";
import { healthcheck } from "../../controllers/healthcheck.controller.js";

const router = Router();

// System health and monitoring routes
router.route("/health").get(healthcheck);

// Additional system routes can be added here
router.route("/status").get((req, res) => {
    res.status(200).json({
        status: "success",
        message: "System is operational",
        timestamp: new Date().toISOString(),
        version: "2.0.0"
    });
});

export default router;
