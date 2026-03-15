import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { addLabReport } from "../controllers/labReportController.js";

const router = express.Router();

router.use(authMiddleware);

router.post("/", addLabReport);

export default router;
