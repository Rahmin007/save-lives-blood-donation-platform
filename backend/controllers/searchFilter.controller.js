import Bank from "../models/bank.model.js";
import User from "../models/user.model.js";
import Post from "../models/post.model.js";

//hjb
export const filterBanksByBloodGroup = async (req, res) => {
  try {
    const { bloodgroup } = req.query;

    if (!bloodgroup) {
      return res.status(400).json({ message: "Blood group is required" });
    }

    const bloodgroupmap = {
      "A+": "A_positive",
      "A-": "A_negative",
      "B+": "B_positive",
      "B-": "B_negative",
      "AB+": "AB_positive",
      "AB-": "AB_negative",
      "O+": "O_positive",
      "O-": "O_negative",
    };

    const key = bloodgroupmap[bloodgroup];

    if (!key) {
      return res.status(400).json({ message: "Invalid blood group" });
    }

    // Fetch all banks, including those with 0 quantity
    const banks = await Bank.find(
      {},
      { name: 1, location: 1, [`bloodInventory.${key}`]: 1 }
    );

    return res.status(200).json({
      message: "Banks found",
      bloodgroup: bloodgroup, // Include searched blood group for clarity
      banks: banks.map((bank) => ({
        _id: bank._id,
        name: bank.name,
        location: bank.location,
        quantity: bank.bloodInventory[key] || 0, // Ensure 0 if undefined
      })),
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch banks", error: error.message });
  }
};

//raz
export const filterDonors = async (req, res) => {
  try {
    const { bloodgroup, longitude, latitude, maxDistance } = req.query;

    if (!bloodgroup) {
      return res.status(400).json({ message: "Blood group is required" });
    }

    let query = { bloodGroup: bloodgroup }; // Fix: Match the field name exactly

    if (longitude && latitude) {
      query.location = {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [parseFloat(longitude), parseFloat(latitude)],
          },
          $maxDistance: maxDistance ? parseInt(maxDistance) : 5000, // Default: 5km
        },
      };
    }

    const donors = await User.find(query, {
      name: 1,
      mobile: 1,
      location: 1,
      bloodGroup: 1,
    });

    // 🔹 Handle case: No matching donors found
    if (!donors.length) {
      return res.status(404).json({
        message: "No donors found for the given blood group and location",
        bloodgroup,
      });
    }

    return res.status(200).json({
      message: "Donors found",
      bloodgroup,
      donors,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch donors",
      error: error.message,
    });
  }
};

//ar
export const filterPosts = async (req, res) => {
  try {
    const { urgency, time } = req.query;

    let filter = {};

    if (urgency) {
      if (["High", "Medium", "Low"].includes(urgency)) {
        filter.urgency = urgency;
      } else {
        return res.status(400).json({ message: "Invalid urgency" });
      }
    }

    if (time) {
      let startDate;

      const now = new Date();

      if (time === "today") {
        startDate = new Date(now.setHours(0, 0, 0, 0));
      } else if (time === "1 week") {
        startDate = new Date(now.setDate(now.getDate() - 7));
      } else if (time === "1 month") {
        startDate = new Date(now.setMonth(now.getMonth() - 1));
      } else {
        return res.status(400).json({ message: "Invalid time" });
      }

      filter.createdAt = { $gte: startDate };
    }

    const posts = await Post.find(filter)
      .sort({ urgency: 1, createdAt: -1 })
      .populate("user", "name");
    if (posts.length === 0) {
      return res
        .status(404)
        .json({ message: "Sorry, no posts found in this category." });
    }

    return res.status(200).json({
      message: "Posts found",
      posts,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch posts", error: error.message });
  }
};
