import { chromium } from "playwright";
import AxeBuilder from "@axe-core/playwright";

/**
 * The 10 WCAG 2.2 success criteria this MVP scanner targets.
 * Mapped to their corresponding axe-core rule ids so results can be
 * filtered down to exactly this scope instead of axe's full rule set.
 *
 * Two criteria (2.4.4, 2.4.6) are "presence only" checks - axe can tell
 * us a link/heading has no discernible text, but not whether existing
 * text is actually descriptive. Those get flagged as "needs_review"
 * rather than "open" when text IS present, since judging quality is
 * left to the AI remediation module (out of scope for this module).
 */
export const TARGET_CRITERIA = {
  "1.1.1": { title: "Non-text Content", axeRules: ["image-alt", "input-image-alt", "area-alt", "object-alt"] },
  "1.3.1": { title: "Info and Relationships", axeRules: ["label", "th-has-data-cells", "list", "definition-list"] },
  "1.3.2": { title: "Meaningful Sequence", axeRules: ["tabindex"] },
  "1.4.3": { title: "Contrast (Minimum)", axeRules: ["color-contrast"] },
  "1.4.4": { title: "Resize Text", axeRules: ["meta-viewport"] },
  "1.4.11": { title: "Non-text Contrast", axeRules: ["color-contrast"] },
  "2.4.2": { title: "Page Titled", axeRules: ["document-title"] },
  "2.4.4": { title: "Link Purpose (In Context)", axeRules: ["link-name"], presenceOnly: true },
  "2.4.6": { title: "Headings and Labels", axeRules: ["empty-heading", "heading-order"], presenceOnly: true },
  "4.1.2": { title: "Name, Role, Value", axeRules: ["aria-required-attr", "aria-valid-attr-value", "aria-valid-attr", "button-name", "aria-command-name"] },
};

const ALL_TARGET_AXE_RULES = [
  ...new Set(Object.values(TARGET_CRITERIA).flatMap((c) => c.axeRules)),
];

const SEVERITY_MAP = {
  critical: "critical",
  serious: "serious",
  moderate: "moderate",
  minor: "minor",
};

const axeRuleToCriterion = (axeRuleId) => {
  const entry = Object.entries(TARGET_CRITERIA).find(([, cfg]) =>
    cfg.axeRules.includes(axeRuleId)
  );
  return entry ? { code: entry[0], ...entry[1] } : null;
};

/**
 * Crawls a single page with a headless Chromium browser and runs axe-core
 * against it, restricted to the rules backing our 10 target WCAG 2.2 SCs.
 *
 * @param {string} url - Absolute URL to scan
 * @returns {Promise<object>} structured scan result
 */
export async function scanWebsite(url) {
  let browser;

  try {
    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
      userAgent:
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    });
    const page = await context.newPage();

    const response = await page.goto(url, {
      waitUntil: "domcontentloaded", // networkidle times out on sites with polling/ads
      timeout: 45000,
    });

    if (!response || !response.ok()) {
      throw new Error(
        `Could not load page (status ${response ? response.status() : "no response"})`
      );
    }

    // Basic page metadata, gathered directly from the DOM
    const pageMeta = await page.evaluate(() => ({
      title: document.title || "",
      lang: document.documentElement.getAttribute("lang") || "",
      imageCount: document.querySelectorAll("img").length,
      linkCount: document.querySelectorAll("a[href]").length,
      formCount: document.querySelectorAll("form").length,
      headingCount: document.querySelectorAll("h1, h2, h3, h4, h5, h6").length,
    }));

    // Run axe-core scoped to WCAG 2.2 A/AA tags, then further restrict
    // to just the rules that back our 10 target criteria
    const axeResults = await new AxeBuilder({ page })
      .withTags(["wcag22a", "wcag22aa", "wcag2a", "wcag2aa"])
      .include("html")
      .analyze();

    const issues = [];
    const severityCounts = { critical: 0, serious: 0, moderate: 0, minor: 0 };

    for (const violation of axeResults.violations) {
      const criterion = axeRuleToCriterion(violation.id);
      if (!criterion) continue; // outside our 10-criterion MVP scope

      const severity = SEVERITY_MAP[violation.impact] || "moderate";
      severityCounts[severity] += violation.nodes.length;

      for (const node of violation.nodes) {
        issues.push({
          wcagCriterion: `${criterion.code} ${criterion.title}`,
          severity,
          element: node.html?.slice(0, 300) || "",
          description: violation.description || violation.help,
          status: criterion.presenceOnly ? "needs_review" : "open",
        });
      }
    }

    // "Needs review" items from axe (things it couldn't be certain about)
    // that fall inside our target rule set
    const needsReview = axeResults.incomplete
      .filter((item) => ALL_TARGET_AXE_RULES.includes(item.id))
      .map((item) => {
        const criterion = axeRuleToCriterion(item.id);
        return {
          wcagCriterion: criterion ? `${criterion.code} ${criterion.title}` : item.id,
          severity: SEVERITY_MAP[item.impact] || "moderate",
          element: item.nodes[0]?.html?.slice(0, 300) || "",
          description: item.description || item.help,
          status: "needs_review",
        };
      });

    const allIssues = [...issues, ...needsReview];
    const totalIssues = allIssues.length;

    // Simple scoring model: start at 100, deduct weighted points per
    // severity, floor at 0. This is a placeholder scoring approach -
    // documented as such since a defensible scoring model is a design
    // decision worth discussing in the report, not something to treat
    // as objectively "correct".
    const weights = { critical: 10, serious: 5, moderate: 2, minor: 1 };
    const deduction = allIssues.reduce((sum, i) => sum + (weights[i.severity] || 0), 0);
    const accessibilityScore = Math.max(0, Math.round(100 - deduction));

    await browser.close();

    return {
      status: "completed",
      url,
      pageMeta,
      accessibilityScore,
      totalIssues,
      severityCounts,
      issues: allIssues,
      criteriaScanned: Object.entries(TARGET_CRITERIA).map(([code, cfg]) => ({
        code,
        title: cfg.title,
        presenceOnly: Boolean(cfg.presenceOnly),
      })),
      scannedAt: new Date().toISOString(),
    };
  } catch (error) {
    if (browser) await browser.close();
    return {
      status: "failed",
      url,
      error: error.message,
      scannedAt: new Date().toISOString(),
    };
  }
}