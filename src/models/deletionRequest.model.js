import mongoose from "mongoose";

const deletionRequestSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    email: { type: String, required: true },
    requestedAt: { type: Date, default: Date.now },
    status: { type: String, default: "pending" },
  },
  { timestamps: true }
);

export default mongoose.models.DeletionRequest ||
  mongoose.model("DeletionRequest", deletionRequestSchema);