import mongoose from "mongoose";

const bankSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    bloodInventory: {
      A_positive: { type: Number, default: 0 },
      A_negative: { type: Number, default: 0 },
      B_positive: { type: Number, default: 0 },
      B_negative: { type: Number, default: 0 },
      AB_positive: { type: Number, default: 0 },
      AB_negative: { type: Number, default: 0 },
      O_positive: { type: Number, default: 0 },
      O_negative: { type: Number, default: 0 },
    },
    location: {
      latitude: { type: Number, required: true },
      longitude: { type: Number, required: true },
    },
  },
  { timestamps: true }
);

const Bank = mongoose.model("Bank", bankSchema);

export default Bank;
