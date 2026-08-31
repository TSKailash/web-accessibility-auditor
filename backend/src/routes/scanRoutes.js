import { Router } from "express";
import { body } from "express-validator";
import {
  createScan,
  getScans,
  getScanById,
  getScanCriteria,
} from "../controllers/scanController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = Router();

router.use(protect); // every scan route requires authentication

const scanValidation = [
  body("url")
    .trim()
    .notEmpty()
    .withMessage("A website URL is required")
    .isURL({ require_protocol: true })
    .withMessage("Enter a valid URL including http:// or https://"),
];

// NOTE: /criteria must be declared before the /:id route so Express
// doesn't try to treat "criteria" as a scan id.
router.get("/criteria", getScanCriteria);
router.get("/", getScans);
router.post("/", scanValidation, createScan);
router.get("/:id", getScanById);

export default router;
