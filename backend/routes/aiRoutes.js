import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { predictRisk } from "../controllers/aiController.js";

const router = express.Router();

router.use(authMiddleware);

router.post("/predict-risk", predictRisk);

export default router;
