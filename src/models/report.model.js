const mongoose = require("mongoose");

const ReportSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    contentId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "onModel",
    },

    onModel: {
      type: String,
      required: true,
      enum: ["Story", "Interaction"],
    },

    reason: {
      type: String,
      required: true,
      enum: [
        "Spam",
        "Contenido de odio",
        "Acoso",
        "Información falsa",
        "Contenido explícito",
        "Violencia",
        "Otro",
      ],
    },

    details: {
      type: String,
    },

    status: {
      type: String,
      enum: ["pending", "in_review", "resolved", "dismissed"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

ReportSchema.index({ userId: 1, contentId: 1 }, { unique: true });

const Report = mongoose.model("Report", ReportSchema);

module.exports = Report;
