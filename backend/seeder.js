// Blood bank seed data. Banks are added automatically on first start (utils/startup.js);
// run `npm run seed:banks` to reset them manually.
import dotenv from "dotenv";
import mongoose from "mongoose";
import { fileURLToPath } from "url";

export const randomInventory = () => ({
  A_positive: Math.floor(Math.random() * 50),
  A_negative: Math.floor(Math.random() * 50),
  B_positive: Math.floor(Math.random() * 50),
  B_negative: Math.floor(Math.random() * 50),
  AB_positive: Math.floor(Math.random() * 50),
  AB_negative: Math.floor(Math.random() * 50),
  O_positive: Math.floor(Math.random() * 50),
  O_negative: Math.floor(Math.random() * 50),
});

export const BANKS = [
  { name: "Dhaka Central Blood Bank", location: { latitude: 23.8103, longitude: 90.4125 } },
  { name: "Bangladesh Red Crescent Blood Bank", location: { latitude: 23.7981, longitude: 90.4173 } },
  { name: "HealthCare Blood Bank", location: { latitude: 23.7509, longitude: 90.3935 } },
  { name: "Medix Blood Donation Center", location: { latitude: 23.7806, longitude: 90.4194 } },
  { name: "Dhaka Medical Blood Bank", location: { latitude: 23.727, longitude: 90.3965 } },
];

const resetBanks = async () => {
  dotenv.config();
  const { default: Bank } = await import("./models/bank.model.js");
  await mongoose.connect(process.env.MONGO_URI, { dbName: process.env.MONGO_DB_NAME || "save-lives" });
  await Bank.deleteMany({});
  await Bank.insertMany(BANKS.map((b) => ({ ...b, bloodInventory: randomInventory() })));
  console.log(`Seeded ${BANKS.length} blood banks`);
  await mongoose.disconnect();
};

// Only runs when executed directly: `node seeder.js --seed`
if (process.argv[1] === fileURLToPath(import.meta.url) && process.argv.includes("--seed")) {
  resetBanks().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
