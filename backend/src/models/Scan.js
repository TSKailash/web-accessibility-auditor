import mongoose from "mongoose";

const scanSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    website: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Website",
      required: true,
      index: true,
    },
    url: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["queued", "running", "completed", "failed"],
      default: "queued",
    },
    accessibilityScore: {
      type: Number,
      min: 0,
      max: 100,
      default: null,
    },
    totalIssues: {
      type: Number,
      default: 0,
    },
    severityCounts: {
      critical: { type: Number, default: 0 },
      serious: { type: Number, default: 0 },
      moderate: { type: Number, default: 0 },
      minor: { type: Number, default: 0 },
    },
    // Raw per-criterion rule findings from the crawler/scanner, keyed by WCAG SC.
    // Kept lightweight here; detailed issues live in AccessibilityIssue documents.
    summary: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    error: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

const Scan = mongoose.model("Scan", scanSchema);

export default Scan;
