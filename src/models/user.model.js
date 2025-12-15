//src/models/user.model.js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      unique: true, // Ensures no duplicate entries for Clerk's userId
    },
    instagramAccessToken: {
      type: String,
      required: false,
    },
    instagramAccountId: {
      type: String,
      required: false,
    },
    instagramUsername: {
      type: String,
      required: true, // Required because it is the user's primary Instagram username
    },
      hasViewedPortfolio: {
      type: Boolean,
      default: false 
    },
    onboardingData: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "OnboardingData", // Links to the OnboardingData schema
      required: false, // Allows flexibility to add this field later
    },
    facebookPageName: {
      type: String,
      required: false, // added to save the fb page name
    },

    subscription: {
      plan: { type: String, enum: ["free", "early_bird", "trial", "pro"], default: "free" },
      trialStartedAt: { type: Date, default: null },  // for project tracking of trial updated to pro or not
      trialEndsAt: { type: Date, default: null },
      subscriptionId: { type: String, default: null }, // Razorpay subscription id (not for early bird)
      nextBillingDate: { type: Date, default: null },  // Razorpay sends webhook updates
      isActive: { type: Boolean, default: true },
    },
  usage: {
      generationsUsed: { type: Number, default: 0 },
      projectsUsed: { type: Number, default: 0 },
    },
    limits: {
    generationLimit: { type: Number, default: 10 }, // free plan default
    projectLimit: { type: Number, default: 8 },
  },

  },
  { timestamps: true }
);

const User =  mongoose?.models?.User || mongoose.model("User", userSchema);
export default User;

