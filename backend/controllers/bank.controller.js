import Bank from "../models/bank.model.js";
import BankRequest from "../models/bankrequest.model.js";
import { notifyUserBankRequestStatus, sendAdminNotification } from "./notification.controller.js";
import { BLOOD_GROUPS, fail, intInRange, isId } from "../utils/http.js";

export const INVENTORY_KEY = {
  "A+": "A_positive", "A-": "A_negative", "B+": "B_positive", "B-": "B_negative",
  "AB+": "AB_positive", "AB-": "AB_negative", "O+": "O_positive", "O-": "O_negative",
};

/** A user asks a blood bank for blood. */
export const createBankRequest = async (req, res) => {
  const { bank, bloodgroup, quantity } = req.body;
  if (!BLOOD_GROUPS.includes(bloodgroup)) return fail(res, 400, "Please choose a valid blood group.");
  const bags = intInRange(quantity, 1, 10);
  if (bags === null) return fail(res, 400, "Quantity must be between 1 and 10 bags.");

  // Accept the bank's id (preferred) or its name (older frontend).
  const bankDoc = isId(bank) ? await Bank.findById(bank) : await Bank.findOne({ name: bank });
  if (!bankDoc) return fail(res, 404, "Blood bank not found.");

  const request = await BankRequest.create({
    bank: bankDoc._id,
    bloodgroup,
    quantity: bags,
    location: bankDoc.location,
    user: req.user._id,
  });
  await sendAdminNotification(request);
  await request.populate("bank", "name");
  res.status(201).json({ message: "Request sent to the blood bank", request });
};

/** Admin: all requests, pending first. */
export const getAllBankRequests = async (_req, res) => {
  const requests = await BankRequest.find()
    .sort({ createdAt: -1 })
    .limit(300)
    .populate("bank", "name")
    .populate("user", "name mobile");
  const pendingFirst = (r) => (r.status === "pending" ? 0 : 1);
  requests.sort((a, b) => pendingFirst(a) - pendingFirst(b) || b.createdAt - a.createdAt);
  res.json(requests);
};

export const getAllBankData = async (_req, res) => {
  res.json(await Bank.find().sort({ name: 1 }));
};

/** Admin: rename a bank or update its stock. */
export const updateBankDetails = async (req, res) => {
  const { bankid } = req.params;
  if (!isId(bankid)) return fail(res, 400, "Invalid bank.");
  const { name, bloodInventory } = req.body;
  const update = {};
  if (name !== undefined) {
    if (!String(name).trim()) return fail(res, 400, "Bank name cannot be empty.");
    update.name = String(name).trim();
  }
  if (bloodInventory !== undefined) {
    for (const key of Object.values(INVENTORY_KEY)) {
      if (bloodInventory[key] === undefined) continue;
      const units = intInRange(bloodInventory[key], 0, 10000);
      if (units === null) return fail(res, 400, "Stock must be a whole number of bags.");
      update[`bloodInventory.${key}`] = units;
    }
  }
  const bank = await Bank.findByIdAndUpdate(bankid, { $set: update }, { new: true, runValidators: true });
  if (!bank) return fail(res, 404, "Bank not found.");
  res.json({ message: "Bank updated", bank });
};

/** Admin: accept (reduces stock) or reject a request. The request is kept so the user sees its status. */
export const processBankrequest = async (req, res) => {
  const { requestid } = req.params;
  const { action } = req.body;
  if (!isId(requestid)) return fail(res, 400, "Invalid request.");
  if (!["accepted", "rejected"].includes(action)) return fail(res, 400, 'Action must be "accepted" or "rejected".');

  const request = await BankRequest.findById(requestid).populate("bank", "name");
  if (!request) return fail(res, 404, "Request not found.");
  if (request.status !== "pending") return fail(res, 400, "This request was already processed.");

  if (action === "accepted") {
    const key = `bloodInventory.${INVENTORY_KEY[request.bloodgroup]}`;
    // Atomic: only subtracts if enough stock is left (no race between two admins).
    const bank = await Bank.findOneAndUpdate(
      { _id: request.bank._id, [key]: { $gte: request.quantity } },
      { $inc: { [key]: -request.quantity } },
      { new: true },
    );
    if (!bank) return fail(res, 400, "Not enough stock at this blood bank for this request.");
  }

  request.status = action;
  await request.save();
  await notifyUserBankRequestStatus(request, action, request.bank?.name ?? "the blood bank");
  res.json({ message: `Request ${action}`, request });
};

export const getUserBankRequest = async (req, res) => {
  const requests = await BankRequest.find({ user: req.user._id })
    .populate("bank", "name")
    .sort({ createdAt: -1 });
  res.json(requests);
};
