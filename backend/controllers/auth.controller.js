import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import { BLOOD_GROUPS, fail, validCoords } from "../utils/http.js";
import { adminEmails } from "../utils/startup.js";

const ACCESS_MS = 30 * 60 * 1000; // 30 minutes
const REFRESH_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// -------- helpers --------
const signAccess = (user) => jwt.sign({ id: user._id }, process.env.JWT_ACCESS_SECRET, { expiresIn: "30m" });
const signRefresh = (user) => jwt.sign({ id: user._id }, process.env.JWT_REFRESH_SECRET, { expiresIn: "7d" });

const cookieOpts = (maxAge) => {
  const isProd = process.env.NODE_ENV === "production";
  // Frontend and API share one domain in production, so "lax" + secure works everywhere.
  return { httpOnly: true, secure: isProd, sameSite: "lax", path: "/", ...(maxAge ? { maxAge } : {}) };
};

const setCookies = (res, user) => {
  res.cookie("accessToken", signAccess(user), cookieOpts(ACCESS_MS));
  res.cookie("refreshToken", signRefresh(user), cookieOpts(REFRESH_MS));
};

/** The profile fields that are safe to send to the browser (no password hash). */
const publicUser = (user) => user.toJSON();

/** Validates sign-up / profile data. `partial` allows missing fields (profile edits). */
const validateProfile = (data, { partial = false } = {}) => {
  const has = (key) => data[key] !== undefined && data[key] !== null && data[key] !== "";
  const need = (key) => !partial || has(key);

  if (need("name") && String(data.name ?? "").trim().length < 2) return "Please enter your name.";
  if (need("email") && !EMAIL_RE.test(String(data.email ?? "").trim())) return "Please enter a valid email address.";
  if ((!partial || has("password")) && String(data.password ?? "").length < 6) return "Password must be at least 6 characters.";
  if (need("bloodGroup") && !BLOOD_GROUPS.includes(data.bloodGroup)) return "Please choose a valid blood group.";
  if (need("gender") && !["male", "female"].includes(data.gender)) return "Please choose a gender.";
  if (need("mobile") && !/^1\d{9}$/.test(String(data.mobile ?? ""))) return "Mobile number must be 10 digits starting with 1 (after +880).";
  if (need("age") && !(Number(data.age) >= 18 && Number(data.age) <= 65)) return "Donors must be between 18 and 65 years old.";
  if (need("weight") && !(Number(data.weight) >= 30 && Number(data.weight) <= 250)) return "Please enter a valid weight in kg.";
  if (need("height") && !(Number(data.height) >= 100 && Number(data.height) <= 250)) return "Please enter a valid height in cm.";
  if ((!partial || has("latitude") || has("longitude")) && !validCoords(data.latitude, data.longitude)) return "Please choose a valid location.";
  return null;
};

// -------- controllers --------
export const signup = async (req, res) => {
  const error = validateProfile(req.body);
  if (error) return fail(res, 400, error);

  const { name, password, bloodGroup, mobile, gender, age, weight, height, latitude, longitude } = req.body;
  const email = String(req.body.email).trim().toLowerCase();
  try {
    if (await User.exists({ email })) return fail(res, 409, "An account with this email already exists.");

    const user = await User.create({
      name: String(name).trim(),
      email,
      password: await bcrypt.hash(password, 10),
      bloodGroup,
      mobile: Number(mobile),
      gender,
      age: Number(age),
      weight: Number(weight),
      height: Number(height),
      role: adminEmails().includes(email) ? "admin" : "user",
      location: { type: "Point", coordinates: [Number(longitude), Number(latitude)] },
    });

    setCookies(res, user);
    res.status(201).json({ message: "Account created", user: publicUser(user) });
  } catch (err) {
    console.error("signup", err);
    fail(res, 500, "Sign-up failed. Please try again.");
  }
};

export const login = async (req, res) => {
  const email = String(req.body.email || "").trim().toLowerCase();
  const password = String(req.body.password || "");
  if (!email || !password) return fail(res, 400, "Please enter your email and password.");
  try {
    const user = await User.findOne({ email });
    // Same message for "no account" and "wrong password", so emails can't be probed.
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return fail(res, 401, "Incorrect email or password.");
    }
    setCookies(res, user);
    res.json({ message: "Login successful", user: publicUser(user) });
  } catch (err) {
    console.error("login", err);
    fail(res, 500, "Login failed. Please try again.");
  }
};

export const logout = (_req, res) => {
  res.clearCookie("accessToken", cookieOpts());
  res.clearCookie("refreshToken", cookieOpts());
  res.json({ message: "Logged out" });
};

export const getUserProfile = (req, res) => res.json({ user: req.user });

/** Admin only: every account, without password hashes. */
export const getAllUser = async (_req, res) => {
  const users = await User.find().select("-password").sort({ createdAt: -1 });
  res.json(users);
};

export const updateUser = async (req, res) => {
  const error = validateProfile(req.body, { partial: true });
  if (error) return fail(res, 400, error);
  try {
    const user = await User.findById(req.user._id);
    if (!user) return fail(res, 404, "User not found.");

    const { name, password, bloodGroup, mobile, gender, age, weight, height, latitude, longitude } = req.body;
    if (req.body.email) {
      const email = String(req.body.email).trim().toLowerCase();
      if (email !== user.email && (await User.exists({ email }))) {
        return fail(res, 409, "That email is already used by another account.");
      }
      user.email = email;
    }
    if (name) user.name = String(name).trim();
    if (password) user.password = await bcrypt.hash(password, 10);
    if (bloodGroup) user.bloodGroup = bloodGroup;
    if (mobile) user.mobile = Number(mobile);
    if (gender) user.gender = gender;
    if (age) user.age = Number(age);
    if (weight) user.weight = Number(weight);
    if (height) user.height = Number(height);
    if (validCoords(latitude, longitude)) {
      user.location = { type: "Point", coordinates: [Number(longitude), Number(latitude)] };
    }

    await user.save();
    res.json({ message: "Profile updated", user: publicUser(user) });
  } catch (err) {
    console.error("updateUser", err);
    fail(res, 500, "Could not update your profile.");
  }
};

export const refreshAccessToken = async (req, res) => {
  const token = req.cookies?.refreshToken;
  if (!token) return fail(res, 401, "Please log in.");
  try {
    const { id } = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(id);
    if (!user) return fail(res, 401, "Please log in.");
    res.cookie("accessToken", signAccess(user), cookieOpts(ACCESS_MS));
    res.json({ message: "Session refreshed" });
  } catch {
    fail(res, 401, "Your session has expired. Please log in again.");
  }
};

export const calculateBMI = (req, res) => {
  const { weight, height } = req.user;
  if (!weight || !height) return fail(res, 400, "Add your height and weight to see your BMI.");
  const bmi = weight / (height / 100) ** 2;
  const category = bmi < 18.5 ? "Underweight" : bmi < 25 ? "Normal weight" : bmi < 30 ? "Overweight" : "Obese";
  res.json({ bmi: Number(bmi.toFixed(1)), category });
};
