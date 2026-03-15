import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { addVitals, updateVitals } from "../controllers/vitalsController.js";

const router = express.Router();

router.use(authMiddleware);

router.post("/", addVitals);
router.put("/:id", updateVitals);

export default router;
