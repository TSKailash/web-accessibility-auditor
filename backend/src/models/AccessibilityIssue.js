import mongoose from "mongoose";

const accessibilityIssueSchema = new mongoose.Schema(
  {
    scan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Scan",
      required: true,
      index: true,
    },
    wcagCriterion: {
      type: String, // e.g. "1.1.1 Non-text Content"
      required: true,
    },
    severity: {
      type: String,
      enum: ["critical", "serious", "moderate", "minor"],
      required: true,
    },
    element: {
      type: String, // outerHTML snippet or CSS selector of the offending element
      default: "",
    },
    description: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["open", "resolved", "needs_review"],
      default: "open",
    },
  },
  { timestamps: true }
);

const AccessibilityIssue = mongoose.model("AccessibilityIssue", accessibilityIssueSchema);

export default AccessibilityIssue;
