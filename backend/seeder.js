// backend/seeder.js
import dotenv from "dotenv";
import mongoose from "mongoose";
import Bank from "./models/bank.model.js";

dotenv.config();

// Function to generate random blood inventory
const generateRandomBloodInventory = () => ({
  A_positive: Math.floor(Math.random() * 50),
  A_negative: Math.floor(Math.random() * 50),
  B_positive: Math.floor(Math.random() * 50),
  B_negative: Math.floor(Math.random() * 50),
  AB_positive: Math.floor(Math.random() * 50),
  AB_negative: Math.floor(Math.random() * 50),
  O_positive: Math.floor(Math.random() * 50),
  O_negative: Math.floor(Math.random() * 50),
});

const banks = [
  {
    name: "Dhaka Central Blood Bank",
    bloodInventory: generateRandomBloodInventory(),
    location: { latitude: 23.8103, longitude: 90.4125 },
  },
  {
    name: "Bangladesh Red Crescent Blood Bank",
    bloodInventory: generateRandomBloodInventory(),
    location: { latitude: 23.7981, longitude: 90.4173 },
  },
  {
    name: "HealthCare Blood Bank",
    bloodInventory: generateRandomBloodInventory(),
    location: { latitude: 23.7509, longitude: 90.3935 },
  },
  {
    name: "Medix Blood Donation Center",
    bloodInventory: generateRandomBloodInventory(),
    location: { latitude: 23.7806, longitude: 90.4194 },
  },
  {
    name: "Dhaka Medical Blood Bank",
    bloodInventory: generateRandomBloodInventory(),
    location: { latitude: 23.727, longitude: 90.3965 },
  },
];

const seedBanks = async () => {
  try {
    if (!process.env.MONGO_URI) throw new Error("MONGO_URI missing");
    await mongoose.connect(process.env.MONGO_URI);

    await Bank.deleteMany({});
    await Bank.insertMany(banks);

    console.log("✅ Blood banks seeded successfully!");
  } catch (error) {
    console.error("❌ Seeding failed:", error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

// Run only if "--seed" is passed
if (process.argv.includes("--seed")) {
  seedBanks();
}
