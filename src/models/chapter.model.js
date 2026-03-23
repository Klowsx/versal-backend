const mongoose = require("mongoose");

const ChapterSchema = new mongoose.Schema(
  {
    story: { type: mongoose.Schema.Types.ObjectId, ref: "Story", required: true },
    chapterNumber: { type: Number, required: true },
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true },
    images: [{ type: String }],
    videos: [{ type: String }],
    status: { type: String, enum: ["draft", "published"], default: "draft" },
    publishedAt: { type: Date, default: null },
  },
  {
    timestamps: true,
  }
);

ChapterSchema.pre("save", function (next) {
  if (this.isModified("status") && this.status === "published" && !this.publishedAt) {
    this.publishedAt = Date.now();
  }
  next();
});

ChapterSchema.index({ story: 1, chapterNumber: 1 }, { unique: true });

const Chapter = mongoose.model("Chapter", ChapterSchema);

module.exports = Chapter;
