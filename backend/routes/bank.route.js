import express from "express";

import {
  authenticateAdmin,
  authenticateUser,
} from "../utils/auth.middleware.js";
import {
  createBankRequest,
  getAllBankData,
  getAllBankRequests,
  updateBankDetails,
  processBankrequest,
  getUserBankRequest,
} from "../controllers/bank.controller.js";

const router = express.Router();

router.post("/createbankrequest", authenticateUser, createBankRequest); //raz
router.get("/getAllBankData", authenticateUser, getAllBankData); //hjb
router.get("/getAllBankRequests", authenticateAdmin, getAllBankRequests); //ar
router.patch(
  "/updateBankDetails/:bankid",
  authenticateAdmin,
  updateBankDetails
);
router.patch(
  "/processBankrequest/:requestid",
  authenticateAdmin,
  processBankrequest
); //ar

router.get("/getUserBankRequest", authenticateUser, getUserBankRequest);

export default router;
