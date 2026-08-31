import { validationResult } from "express-validator";
import Website from "../models/Website.js";
import Scan from "../models/Scan.js";
import AccessibilityIssue from "../models/AccessibilityIssue.js";
import { scanWebsite, TARGET_CRITERIA } from "../services/crawlerService.js";
import { asyncHandler } from "../utils/asyncHandler.js";

/**
 * @route   POST /api/scans
 * @body    { url: string }
 * @access  Private
 * Crawls the given URL with Playwright + axe-core, scoped to the 10
 * target WCAG 2.2 criteria, and persists the result.
 */
export const createScan = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array()[0].msg, errors: errors.array() });
  }

  const { url } = req.body;

  // Find or create the parent Website record for this user
  let website = await Website.findOne({ user: req.user._id, url });
  if (!website) {
    website = await Website.create({ user: req.user._id, url });
  }

  const scan = await Scan.create({
    user: req.user._id,
    website: website._id,
    url,
    status: "running",
  });

  const result = await scanWebsite(url);

  if (result.status === "failed") {
    scan.status = "failed";
    scan.error = result.error;
    await scan.save();
    return res.status(502).json({
      message: `Scan failed: ${result.error}`,
      scan,
    });
  }

  scan.status = "completed";
  scan.accessibilityScore = result.accessibilityScore;
  scan.totalIssues = result.totalIssues;
  scan.severityCounts = result.severityCounts;
  scan.summary = {
    pageMeta: result.pageMeta,
    criteriaScanned: result.criteriaScanned,
  };
  await scan.save();

  if (result.issues.length > 0) {
    const issueDocs = result.issues.map((issue) => ({ ...issue, scan: scan._id }));
    await AccessibilityIssue.insertMany(issueDocs);
  }

  res.status(201).json({
    message: "Scan completed",
    scan,
    website,
    issues: result.issues,
  });
});

/**
 * @route   GET /api/scans
 * @access  Private
 * Returns the authenticated user's scan history, most recent first.
 */
export const getScans = asyncHandler(async (req, res) => {
  const scans = await Scan.find({ user: req.user._id })
    .populate("website", "url name")
    .sort({ createdAt: -1 });

  res.status(200).json({ count: scans.length, scans });
});

/**
 * @route   GET /api/scans/:id
 * @access  Private
 */
export const getScanById = asyncHandler(async (req, res) => {
  const scan = await Scan.findOne({ _id: req.params.id, user: req.user._id }).populate(
    "website",
    "url name"
  );

  if (!scan) {
    return res.status(404).json({ message: "Scan not found" });
  }

  const issues = await AccessibilityIssue.find({ scan: scan._id }).sort({ severity: 1 });

  res.status(200).json({ scan, issues });
});

/**
 * @route   GET /api/scans/criteria
 * @access  Private
 * Returns the fixed set of WCAG criteria this MVP scanner covers, so the
 * frontend can render an accurate "what we check" list without hardcoding it.
 */
export const getScanCriteria = asyncHandler(async (req, res) => {
  const criteria = Object.entries(TARGET_CRITERIA).map(([code, cfg]) => ({
    code,
    title: cfg.title,
    presenceOnly: Boolean(cfg.presenceOnly),
  }));
  res.status(200).json({ criteria });
});
