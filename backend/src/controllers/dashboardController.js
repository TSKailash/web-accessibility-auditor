import {
  mockOverview,
  mockWebsites,
  mockScanHistory,
  mockComparison,
  mockCriteriaBreakdown,
  mockRecentIssues,
} from "../data/mockDashboard.js";
import { asyncHandler } from "../utils/asyncHandler.js";

/**
 * @route   GET /api/dashboard/overview
 * @access  Private
 */
export const getOverview = asyncHandler(async (req, res) => {
  res.status(200).json(mockOverview);
});

/**
 * @route   GET /api/dashboard/websites
 * @access  Private
 */
export const getWebsitesSummary = asyncHandler(async (req, res) => {
  res.status(200).json({ websites: mockWebsites });
});

/**
 * @route   GET /api/dashboard/websites/:websiteId/history
 * @access  Private
 */
export const getWebsiteHistory = asyncHandler(async (req, res) => {
  const history = mockScanHistory[req.params.websiteId];
  if (!history) {
    return res.status(404).json({ message: "No mock scan history for this website id" });
  }
  res.status(200).json({ websiteId: req.params.websiteId, history });
});

/**
 * @route   GET /api/dashboard/comparison
 * @access  Private
 */
export const getComparison = asyncHandler(async (req, res) => {
  res.status(200).json(mockComparison);
});

/**
 * @route   GET /api/dashboard/criteria-breakdown
 * @access  Private
 */
export const getCriteriaBreakdown = asyncHandler(async (req, res) => {
  res.status(200).json({ criteria: mockCriteriaBreakdown });
});

/**
 * @route   GET /api/dashboard/recent-issues
 * @access  Private
 */
export const getRecentIssues = asyncHandler(async (req, res) => {
  res.status(200).json({ issues: mockRecentIssues });
});
