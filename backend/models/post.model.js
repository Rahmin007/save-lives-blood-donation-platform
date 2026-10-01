import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
  {
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },
    bloodGroup: {
      type: String,
      required: true,
      enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
      max: 10,
    },
    location: {
      latitude: { type: Number, required: true },
      longitude: { type: Number, required: true },
    },
    pending: { type: Boolean, default: true },

    urgency: {
      type: String,
      enum: ["High", "Medium", "Low"],
      default: "Low",
    },

    canceled: { type: Boolean, default: false },
    canceledAt: {
      type: Date,
      default: null,
      // Cancelled requests are removed automatically after 7 days.
      index: { expireAfterSeconds: 7 * 24 * 60 * 60 },
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

postSchema.index({ canceled: 1, createdAt: -1 });
postSchema.index({ user: 1, createdAt: -1 });

const Post = mongoose.model("Post", postSchema);

export default Post;
