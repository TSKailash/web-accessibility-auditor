import Website from "../models/Website.js";
import Scan from "../models/Scan.js";
import AccessibilityIssue from "../models/AccessibilityIssue.js";
import { TARGET_CRITERIA } from "../services/crawlerService.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const formatDashboardDate = (date) =>
  new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);

/**
 * @route   GET /api/dashboard/overview
 * @access  Private
 */
export const getOverview = asyncHandler(async (req, res) => {
  const scans = await Scan.find({ user: req.user._id }).sort({ createdAt: -1 });
  const validScores = scans
    .filter((scan) => scan.accessibilityScore !== null && scan.accessibilityScore !== undefined)
    .map((scan) => scan.accessibilityScore);

  res.status(200).json({
    totalWebsites: await Website.countDocuments({ user: req.user._id }),
    totalScans: scans.length,
    averageScore:
      validScores.length > 0
        ? Math.round(validScores.reduce((sum, score) => sum + score, 0) / validScores.length)
        : 0,
    criteriaTracked: Object.keys(TARGET_CRITERIA).length,
  });
});

/**
 * @route   GET /api/dashboard/websites
 * @access  Private
 */
export const getWebsitesSummary = asyncHandler(async (req, res) => {
  const scans = await Scan.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .populate("website", "name url");

  const websiteMap = new Map();

  for (const scan of scans) {
    const websiteId = String(scan.website?._id || scan.website);
    const entry = websiteMap.get(websiteId) || { latest: null, previous: null };

    if (!entry.latest) {
      entry.latest = scan;
    } else {
      entry.previous = entry.latest;
      entry.latest = scan;
    }

    websiteMap.set(websiteId, entry);
  }

  const websites = Array.from(websiteMap.values()).map(({ latest, previous }) => {
    const latestScore = latest?.accessibilityScore ?? 0;
    const previousScore = previous?.accessibilityScore ?? latestScore;
    const trend = latestScore >= previousScore ? "up" : "down";

    return {
      id: String(latest?.website?._id || latest?.website || "unknown"),
      name: latest?.website?.name || latest?.url || "Website",
      url: latest?.website?.url || latest?.url || "",
      latestScore,
      latestScanDate: latest ? formatDashboardDate(latest.createdAt) : "No scans yet",
      trend,
    };
  });

  res.status(200).json({ websites });
});

/**
 * @route   GET /api/dashboard/websites/:websiteId/history
 * @access  Private
 */
export const getWebsiteHistory = asyncHandler(async (req, res) => {
  const scans = await Scan.find({
    user: req.user._id,
    website: req.params.websiteId,
  }).sort({ createdAt: -1 });

  if (!scans.length) {
    return res.status(404).json({ message: "No scan history found for this website" });
  }

  res.status(200).json({ websiteId: req.params.websiteId, history: scans });
});

/**
 * @route   GET /api/dashboard/comparison
 * @access  Private
 */
export const getComparison = asyncHandler(async (req, res) => {
  const scans = await Scan.find({ user: req.user._id }).sort({ createdAt: -1 });

  if (scans.length < 2) {
    return res.status(200).json({
      scoreImprovement: 0,
      issuesResolved: 0,
      previousScan: { date: "No previous scan" },
      currentScan: { date: scans[0] ? formatDashboardDate(scans[0].createdAt) : "No scans yet" },
    });
  }

  const currentScan = scans[0];
  const previousScan = scans[1];
  const scoreImprovement = (currentScan.accessibilityScore ?? 0) - (previousScan.accessibilityScore ?? 0);
  const issuesResolved = Math.max(0, (previousScan.totalIssues ?? 0) - (currentScan.totalIssues ?? 0));

  res.status(200).json({
    scoreImprovement,
    issuesResolved,
    previousScan: { date: formatDashboardDate(previousScan.createdAt) },
    currentScan: { date: formatDashboardDate(currentScan.createdAt) },
  });
});

/**
 * @route   GET /api/dashboard/criteria-breakdown
 * @access  Private
 */
export const getCriteriaBreakdown = asyncHandler(async (req, res) => {
  const scans = await Scan.find({ user: req.user._id }).select("_id");
  const scanIds = scans.map((scan) => scan._id);

  const issues = await AccessibilityIssue.find({ scan: { $in: scanIds } });

  const criteria = Object.entries(TARGET_CRITERIA).map(([code, cfg]) => {
    const matching = issues.filter((issue) => issue.wcagCriterion.startsWith(`${code} `));

    return {
      code,
      title: cfg.title,
      openIssues: matching.filter((issue) => issue.status === "open").length,
      needsReview: matching.filter((issue) => issue.status === "needs_review").length,
    };
  });

  res.status(200).json({ criteria });
});

/**
 * @route   GET /api/dashboard/recent-issues
 * @access  Private
 */
export const getRecentIssues = asyncHandler(async (req, res) => {
  const scans = await Scan.find({ user: req.user._id }).select("_id");
  const scanIds = scans.map((scan) => scan._id);

  const issues = await AccessibilityIssue.find({ scan: { $in: scanIds } })
    .sort({ createdAt: -1 })
    .limit(8)
    .populate({
      path: "scan",
      populate: {
        path: "website",
        select: "name url",
      },
    });

  res.status(200).json({
    issues: issues.map((issue) => ({
      id: issue._id,
      description: issue.description,
      website: issue.scan?.website?.name || issue.scan?.url || "Website",
      wcagCriterion: issue.wcagCriterion,
      severity: issue.severity,
    })),
  });
});
