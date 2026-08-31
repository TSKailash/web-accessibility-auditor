import { Router } from "express";
import {
  getOverview,
  getWebsitesSummary,
  getWebsiteHistory,
  getComparison,
  getCriteriaBreakdown,
  getRecentIssues,
} from "../controllers/dashboardController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = Router();

router.use(protect);

router.get("/overview", getOverview);
router.get("/websites", getWebsitesSummary);
router.get("/websites/:websiteId/history", getWebsiteHistory);
router.get("/comparison", getComparison);
router.get("/criteria-breakdown", getCriteriaBreakdown);
router.get("/recent-issues", getRecentIssues);

export default router;
