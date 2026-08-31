// Static mock data for the dashboard module, per the project brief's
// Module 6/7/8 examples (score, severity counts, scan history, comparison).
// Once the scan + storage pipeline is fully wired up, this file is swapped
// for real aggregation queries against the Scan / AccessibilityIssue
// collections - the /api/dashboard routes are shaped to make that swap
// a drop-in replacement rather than a rewrite.

export const mockOverview = {
  totalWebsites: 3,
  totalScans: 9,
  averageScore: 78,
  criteriaTracked: 10,
};

export const mockWebsites = [
  {
    id: "web_1",
    name: "example.com",
    url: "https://example.com",
    latestScore: 88,
    latestScanDate: "2026-08-20",
    trend: "up",
  },
  {
    id: "web_2",
    name: "portfolio-demo.dev",
    url: "https://portfolio-demo.dev",
    latestScore: 64,
    latestScanDate: "2026-08-18",
    trend: "down",
  },
  {
    id: "web_3",
    name: "campus-events.edu",
    url: "https://campus-events.edu",
    latestScore: 82,
    latestScanDate: "2026-08-21",
    trend: "up",
  },
];

export const mockScanHistory = {
  web_1: [
    { scanId: "scan_1", date: "2026-08-10", score: 62, totalIssues: 35, severityCounts: { critical: 5, serious: 12, moderate: 14, minor: 4 } },
    { scanId: "scan_2", date: "2026-08-15", score: 74, totalIssues: 24, severityCounts: { critical: 2, serious: 8, moderate: 10, minor: 4 } },
    { scanId: "scan_3", date: "2026-08-20", score: 88, totalIssues: 12, severityCounts: { critical: 0, serious: 3, moderate: 6, minor: 3 } },
  ],
};

export const mockComparison = {
  websiteId: "web_1",
  previousScan: { scanId: "scan_1", date: "2026-08-10", score: 62, critical: 5, serious: 12, moderate: 18 },
  currentScan: { scanId: "scan_3", date: "2026-08-20", score: 84, critical: 1, serious: 6, moderate: 12 },
  scoreImprovement: 22,
  issuesResolved: 16,
};

export const mockCriteriaBreakdown = [
  { code: "1.1.1", title: "Non-text Content", openIssues: 4, needsReview: 0 },
  { code: "1.3.1", title: "Info and Relationships", openIssues: 3, needsReview: 0 },
  { code: "1.3.2", title: "Meaningful Sequence", openIssues: 1, needsReview: 0 },
  { code: "1.4.3", title: "Contrast (Minimum)", openIssues: 6, needsReview: 0 },
  { code: "1.4.4", title: "Resize Text", openIssues: 0, needsReview: 0 },
  { code: "1.4.11", title: "Non-text Contrast", openIssues: 2, needsReview: 0 },
  { code: "2.4.2", title: "Page Titled", openIssues: 0, needsReview: 0 },
  { code: "2.4.4", title: "Link Purpose (In Context)", openIssues: 0, needsReview: 5 },
  { code: "2.4.6", title: "Headings and Labels", openIssues: 1, needsReview: 3 },
  { code: "4.1.2", title: "Name, Role, Value", openIssues: 2, needsReview: 0 },
];

export const mockRecentIssues = [
  { id: "iss_1", website: "example.com", wcagCriterion: "1.4.3 Contrast (Minimum)", severity: "serious", description: "Body text contrast ratio is 3.2:1, below the required 4.5:1.", status: "open" },
  { id: "iss_2", website: "portfolio-demo.dev", wcagCriterion: "1.1.1 Non-text Content", severity: "critical", description: "Hero image has no alt attribute.", status: "open" },
  { id: "iss_3", website: "campus-events.edu", wcagCriterion: "2.4.6 Headings and Labels", severity: "minor", description: "Heading text present but flagged for descriptiveness review.", status: "needs_review" },
  { id: "iss_4", website: "example.com", wcagCriterion: "4.1.2 Name, Role, Value", severity: "moderate", description: "Custom dropdown widget missing aria-expanded state.", status: "open" },
  { id: "iss_5", website: "portfolio-demo.dev", wcagCriterion: "2.4.4 Link Purpose (In Context)", severity: "minor", description: "Link text present but flagged for descriptiveness review.", status: "needs_review" },
];
