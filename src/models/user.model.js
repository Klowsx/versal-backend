
const mongoose = require("mongoose");

const subscriptionSchema = new mongoose.Schema({
  type: { type: String, enum: ["basic", "premium"], default: "basic" },
  status: { type: String, enum: ["active", "expired"], default: "active" },
  endDate: { type: Date, default: null },
});

const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  profileImage: { type: String, default: null },
  role: { type: String, enum: ["user", "admin"], default: "user" },
  bio: { type: String, default: null },
  subscription: {
    type: subscriptionSchema,
    default: () => ({ type: "basic", status: "active", endDate: null }),
  },
  following: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  blockedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

  stripeCustomerId: { type: String, unique: false, sparse: true, default: null },
  isPremium: { type: Boolean, default: false },
  premiumSubscriptionId: { type: String, unique: false, sparse: true, default: null },
  subscriptionPlanId: { type: String, unique: false, sparse: true, default: null },
  coins: { type: Number, default: 0 },
});



const UserModel = mongoose.model("User", userSchema);
module.exports = UserModel;