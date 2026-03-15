import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { addPrescription } from "../controllers/prescriptionController.js";

const router = express.Router();

router.use(authMiddleware);

router.post("/", addPrescription);

export default router;
