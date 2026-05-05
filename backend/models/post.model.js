import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
  {
    description: {
      type: String,
      required: true,
    },
    bloodGroup: {
      type: String,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
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
      index: { expireAfterSeconds: 10 },
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

const Post = mongoose.model("Post", postSchema);

export default Post;
