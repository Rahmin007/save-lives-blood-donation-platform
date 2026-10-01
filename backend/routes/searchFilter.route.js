import express from "express";
import { authenticateUser } from "../utils/auth.middleware.js";
import { filterBanksByBloodGroup, filterDonors, filterPosts } from "../controllers/searchFilter.controller.js";
import { wrap } from "../utils/http.js";

const router = express.Router();

router.get("/filterBanksByBloodGroup", authenticateUser, wrap(filterBanksByBloodGroup));
router.get("/filterDonors", authenticateUser, wrap(filterDonors));
router.get("/filterPosts", authenticateUser, wrap(filterPosts));

export default router;
