import Bank from "../models/bank.model.js";
import User from "../models/user.model.js";
import Post from "../models/post.model.js";
import { INVENTORY_KEY } from "./bank.controller.js";
import { BLOOD_GROUPS, URGENCY_LEVELS, fail, validCoords } from "../utils/http.js";

const URGENCY_RANK = { High: 0, Medium: 1, Low: 2 };

/** Every bank's stock for one blood group. */
export const filterBanksByBloodGroup = async (req, res) => {
  const { bloodgroup } = req.query;
  const key = INVENTORY_KEY[bloodgroup];
  if (!key) return fail(res, 400, "Please choose a valid blood group.");
  const banks = await Bank.find({}, { name: 1, location: 1, [`bloodInventory.${key}`]: 1 }).sort({ name: 1 });
  res.json({
    bloodgroup,
    banks: banks.map((b) => ({ _id: b._id, name: b.name, location: b.location, quantity: b.bloodInventory?.[key] ?? 0 })),
  });
};

/** Donors with a blood group, optionally within maxDistance metres of a point (nearest first). */
export const filterDonors = async (req, res) => {
  const { bloodgroup, longitude, latitude, maxDistance } = req.query;
  if (!BLOOD_GROUPS.includes(bloodgroup)) return fail(res, 400, "Please choose a valid blood group.");

  const query = { bloodGroup: bloodgroup, _id: { $ne: req.user._id } };
  if (latitude !== undefined && longitude !== undefined) {
    if (!validCoords(latitude, longitude)) return fail(res, 400, "Invalid location.");
    const metres = Math.min(Math.max(Number(maxDistance) || 5000, 500), 50000); // 0.5–50 km
    query.location = {
      $near: {
        $geometry: { type: "Point", coordinates: [Number(longitude), Number(latitude)] },
        $maxDistance: metres,
      },
    };
  }
  const donors = await User.find(query, { name: 1, mobile: 1, location: 1, bloodGroup: 1 }).limit(50);
  // An empty result is a normal answer, not an error.
  res.json({ bloodgroup, donors });
};

/** Feed filter by urgency and/or time. Cancelled posts are never included. */
export const filterPosts = async (req, res) => {
  const { urgency, time } = req.query;
  const filter = { canceled: false };

  if (urgency) {
    if (!URGENCY_LEVELS.includes(urgency)) return fail(res, 400, "Invalid urgency.");
    filter.urgency = urgency;
  }
  if (time) {
    const start = new Date();
    if (time === "today") start.setHours(0, 0, 0, 0);
    else if (time === "1 week") start.setDate(start.getDate() - 7);
    else if (time === "1 month") start.setMonth(start.getMonth() - 1);
    else return fail(res, 400, "Invalid time range.");
    filter.createdAt = { $gte: start };
  }

  const posts = await Post.find(filter).sort({ createdAt: -1 }).limit(200).populate("user", "name bloodGroup");
  // Sort High → Medium → Low (a plain string sort gave High, Low, Medium).
  posts.sort((a, b) => URGENCY_RANK[a.urgency] - URGENCY_RANK[b.urgency] || b.createdAt - a.createdAt);
  res.json({ posts });
};
