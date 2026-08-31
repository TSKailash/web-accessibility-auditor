import mongoose from "mongoose";

const websiteSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    url: {
      type: String,
      required: [true, "Website URL is required"],
      trim: true,
    },
    name: {
      type: String,
      trim: true,
      default: function defaultName() {
        try {
          return new URL(this.url).hostname;
        } catch {
          return this.url;
        }
      },
    },
  },
  { timestamps: true }
);

const Website = mongoose.model("Website", websiteSchema);

export default Website;
