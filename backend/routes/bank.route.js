import express from "express";
import { authenticateAdmin, authenticateUser } from "../utils/auth.middleware.js";
import {
  createBankRequest, getAllBankData, getAllBankRequests,
  updateBankDetails, processBankrequest, getUserBankRequest,
} from "../controllers/bank.controller.js";
import { wrap } from "../utils/http.js";

const router = express.Router();

router.post("/createbankrequest", authenticateUser, wrap(createBankRequest));
router.get("/getAllBankData", authenticateUser, wrap(getAllBankData));
router.get("/getUserBankRequest", authenticateUser, wrap(getUserBankRequest));
router.get("/getAllBankRequests", authenticateAdmin, wrap(getAllBankRequests));
router.patch("/updateBankDetails/:bankid", authenticateAdmin, wrap(updateBankDetails));
router.patch("/processBankrequest/:requestid", authenticateAdmin, wrap(processBankrequest));

export default router;
