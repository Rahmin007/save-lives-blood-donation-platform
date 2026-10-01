// Runs once when the server starts: makes a fresh deployment usable without a terminal.
import bcrypt from "bcryptjs";
import Bank from "../models/bank.model.js";
import User from "../models/user.model.js";
import Post from "../models/post.model.js";
import { BANKS, randomInventory } from "../seeder.js";

/** Comma-separated ADMIN_EMAILS (e.g. "me@gmail.com,other@gmail.com"). */
export const adminEmails = () =>
  (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

/** Adds the Dhaka blood banks if the collection is empty. */
const ensureBanks = async () => {
  if ((await Bank.estimatedDocumentCount()) > 0) return;
  await Bank.insertMany(BANKS.map((b) => ({ ...b, bloodInventory: randomInventory() })));
  console.log(`Seeded ${BANKS.length} blood banks`);
};

/** Gives the admin role to any existing account listed in ADMIN_EMAILS. */
const promoteAdmins = async () => {
  const emails = adminEmails();
  if (!emails.length) return;
  const { modifiedCount } = await User.updateMany(
    { email: { $in: emails }, role: { $ne: "admin" } },
    { $set: { role: "admin" } },
  );
  if (modifiedCount) console.log(`Promoted ${modifiedCount} account(s) to admin`);
};

const DEMO_DONORS = [
  { name: "Rafi Ahmed", bloodGroup: "O+", gender: "male", coords: [90.4125, 23.8103] },
  { name: "Nusrat Jahan", bloodGroup: "A+", gender: "female", coords: [90.3995, 23.7945] },
  { name: "Tanvir Hasan", bloodGroup: "B+", gender: "male", coords: [90.4203, 23.7808] },
  { name: "Sadia Islam", bloodGroup: "O-", gender: "female", coords: [90.3743, 23.7465] },
  { name: "Imran Khan", bloodGroup: "AB+", gender: "male", coords: [90.4074, 23.7281] },
  { name: "Farzana Akter", bloodGroup: "A-", gender: "female", coords: [90.3654, 23.8223] },
];

/** With SEED_DEMO_DATA=true, adds sample donors and requests so the live demo isn't empty. */
const seedDemoData = async () => {
  if (process.env.SEED_DEMO_DATA !== "true") return;
  if (await User.exists({ email: /@demo\.savelives\.app$/ })) return;
  const password = await bcrypt.hash(`demo-${Math.random()}`, 10); // demo donors can't log in
  const donors = await User.insertMany(
    DEMO_DONORS.map((d, i) => ({
      name: d.name,
      email: `donor${i + 1}@demo.savelives.app`,
      password,
      bloodGroup: d.bloodGroup,
      mobile: 1711000000 + i,
      gender: d.gender,
      age: 22 + i * 3,
      weight: 60 + i * 2,
      height: 160 + i * 3,
      location: { type: "Point", coordinates: d.coords },
    })),
  );
  await Post.insertMany([
    { user: donors[0]._id, description: "My father needs blood for surgery at Dhaka Medical College Hospital tomorrow morning.", bloodGroup: "O-", quantity: 2, urgency: "High", location: { latitude: 23.7259, longitude: 90.3976 } },
    { user: donors[1]._id, description: "Thalassemia patient needs a regular transfusion this week.", bloodGroup: "B+", quantity: 1, urgency: "Medium", location: { latitude: 23.7509, longitude: 90.3935 } },
    { user: donors[2]._id, description: "Planned operation next week at Square Hospital, looking for donors.", bloodGroup: "A+", quantity: 3, urgency: "Low", location: { latitude: 23.7529, longitude: 90.3815 } },
  ]);
  console.log("Seeded demo donors and blood requests");
};

export const runStartupTasks = async () => {
  await ensureBanks();
  await promoteAdmins();
  await seedDemoData();
};
