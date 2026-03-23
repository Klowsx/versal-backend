const mongoose = require("mongoose");

const DonationSchema = new mongoose.Schema(
  {
    donatorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    recipientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    storyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Story",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 1,
    },
    message: {
      type: String,
      trim: true,
      maxLength: 280,
    },
  },
  {
    timestamps: true,
  }
);

const Donation = mongoose.model("Donation", DonationSchema);

module.exports = Donation;
