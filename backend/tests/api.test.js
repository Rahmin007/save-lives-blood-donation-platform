// API tests. Needs a MongoDB server: set MONGO_URI_TEST (default mongodb://127.0.0.1:27017).
// Run with: npm test
import { after, before, describe, test } from "node:test";
import assert from "node:assert/strict";
import mongoose from "mongoose";
import request from "supertest";
import jwt from "jsonwebtoken";

process.env.JWT_ACCESS_SECRET = "test-access-secret";
process.env.JWT_REFRESH_SECRET = "test-refresh-secret";
process.env.ADMIN_EMAILS = "admin@example.com";
process.env.AUTH_RATE_LIMIT = "1000";

const { createApp } = await import("../app.js");
const { default: Bank } = await import("../models/bank.model.js");
const app = createApp();

const profile = (overrides = {}) => ({
  name: "Test User", email: `user${Math.random().toString(36).slice(2)}@example.com`, password: "secret123",
  bloodGroup: "O+", mobile: "1711111111", gender: "male", age: 25, weight: 70, height: 175,
  latitude: 23.81, longitude: 90.41, ...overrides,
});

/** Signs up and returns a supertest agent that keeps the login cookies. */
const signedIn = async (overrides) => {
  const agent = request.agent(app);
  const res = await agent.post("/api/auth/signup").send(profile(overrides));
  assert.equal(res.status, 201, res.text);
  return { agent, user: res.body.user };
};

const post = { description: "Need blood for surgery", bloodGroup: "O+", quantity: 2, urgency: "High", location: { latitude: 23.81, longitude: 90.41 } };

before(async () => {
  await mongoose.connect(process.env.MONGO_URI_TEST || "mongodb://127.0.0.1:27017", { dbName: `save-lives-test-${Date.now()}` });
});
after(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.disconnect();
});

describe("auth", () => {
  test("rejects invalid sign-up data with a clear message", async () => {
    const res = await request(app).post("/api/auth/signup").send(profile({ mobile: "123", age: 12 }));
    assert.equal(res.status, 400);
    assert.match(res.body.message, /Mobile number|between 18 and 65/);
  });

  test("never returns the password hash", async () => {
    const { agent, user } = await signedIn();
    assert.equal(user.password, undefined);
    const me = await agent.get("/api/auth/getUserProfile");
    assert.equal(me.body.user.password, undefined);
  });

  test("duplicate email is refused (case-insensitive)", async () => {
    await signedIn({ email: "dup@example.com" });
    const res = await request(app).post("/api/auth/signup").send(profile({ email: "DUP@example.com" }));
    assert.equal(res.status, 409);
  });

  test("wrong password and unknown email give the same answer", async () => {
    await signedIn({ email: "login@example.com" });
    const wrong = await request(app).post("/api/auth/login").send({ email: "login@example.com", password: "nope-nope" });
    const unknown = await request(app).post("/api/auth/login").send({ email: "ghost@example.com", password: "nope-nope" });
    assert.equal(wrong.status, 401);
    assert.equal(unknown.status, 401);
    assert.equal(wrong.body.message, unknown.body.message);
  });

  test("an expired login returns 401 so the frontend can refresh it", async () => {
    const { user } = await signedIn();
    const expired = jwt.sign({ id: user._id }, process.env.JWT_ACCESS_SECRET, { expiresIn: -10 });
    const res = await request(app).get("/api/auth/getUserProfile").set("Cookie", `accessToken=${expired}`);
    assert.equal(res.status, 401);
  });

  test("refresh issues a new access token", async () => {
    const { agent } = await signedIn();
    const res = await agent.post("/api/auth/refreshAccessToken");
    assert.equal(res.status, 200);
    assert.ok(res.headers["set-cookie"].some((c) => c.startsWith("accessToken=")));
  });

  test("the public test-user route is gone", async () => {
    const res = await request(app).get("/api/auth/createTestUser");
    assert.equal(res.status, 404);
  });

  test("only admins can list all users", async () => {
    const { agent } = await signedIn();
    assert.equal((await agent.get("/api/auth/getAllUser")).status, 403);
    const { agent: admin, user } = await signedIn({ email: "admin@example.com" });
    assert.equal(user.role, "admin");
    const res = await admin.get("/api/auth/getAllUser");
    assert.equal(res.status, 200);
    assert.ok(res.body.every((u) => u.password === undefined));
  });

  test("changing your email to one already in use is refused", async () => {
    await signedIn({ email: "taken@example.com" });
    const { agent } = await signedIn();
    const res = await agent.patch("/api/auth/updateUser").send({ email: "taken@example.com" });
    assert.equal(res.status, 409);
  });
});

describe("posts", () => {
  test("validates new posts", async () => {
    const { agent } = await signedIn();
    const res = await agent.post("/api/post/createPost").send({ ...post, quantity: 0 });
    assert.equal(res.status, 400);
  });

  test("a new post comes back with its author's name", async () => {
    const { agent } = await signedIn({ name: "Rahim" });
    const res = await agent.post("/api/post/createPost").send(post);
    assert.equal(res.status, 201);
    assert.equal(res.body.post.user.name, "Rahim");
  });

  test("other users cannot edit, cancel or delete your post", async () => {
    const { agent: owner } = await signedIn();
    const { agent: stranger } = await signedIn();
    const id = (await owner.post("/api/post/createPost").send(post)).body.post._id;
    assert.equal((await stranger.patch(`/api/post/updatePost/${id}`).send({ description: "hacked" })).status, 403);
    assert.equal((await stranger.patch(`/api/post/${id}/cancel`)).status, 403);
    assert.equal((await stranger.delete(`/api/post/deletePost/${id}`)).status, 403);
    assert.equal((await owner.patch(`/api/post/updatePost/${id}`).send({ pending: false })).body.post.pending, false);
    assert.equal((await owner.delete(`/api/post/deletePost/${id}`)).status, 200);
  });

  test("the post-status page loads", async () => {
    const { agent } = await signedIn();
    await agent.post("/api/post/createPost").send(post);
    const res = await agent.get("/api/post/getPostStatusofUser");
    assert.equal(res.status, 200);
    assert.equal(res.body.length, 1);
  });

  test("filter hides cancelled posts and orders High → Medium → Low", async () => {
    const { agent } = await signedIn();
    for (const urgency of ["Low", "High", "Medium"]) await agent.post("/api/post/createPost").send({ ...post, urgency });
    const cancelled = (await agent.post("/api/post/createPost").send({ ...post, urgency: "High", description: "cancel me" })).body.post._id;
    await agent.patch(`/api/post/${cancelled}/cancel`);
    const res = await agent.get("/api/searchFilter/filterPosts?time=today");
    assert.equal(res.status, 200);
    assert.ok(!res.body.posts.some((p) => p._id === cancelled));
    const ranks = res.body.posts.map((p) => ({ High: 0, Medium: 1, Low: 2 })[p.urgency]);
    assert.deepEqual(ranks, [...ranks].sort());
  });

  test("an empty filter result is 200 with an empty list", async () => {
    const { agent } = await signedIn();
    const res = await agent.get("/api/searchFilter/filterPosts?urgency=Medium&time=today");
    assert.equal(res.status, 200);
    assert.ok(Array.isArray(res.body.posts));
  });
});

describe("blood banks", () => {
  test("quantity is validated and admins see accepted requests reduce stock", async () => {
    const bank = await Bank.create({
      name: `Test Bank ${Date.now()}`, location: { latitude: 23.8, longitude: 90.4 },
      bloodInventory: { O_positive: 5 },
    });
    const { agent: user } = await signedIn();
    assert.equal((await user.post("/api/bank/createbankrequest").send({ bank: bank._id, bloodgroup: "O+", quantity: -3 })).status, 400);
    const created = await user.post("/api/bank/createbankrequest").send({ bank: bank._id, bloodgroup: "O+", quantity: 3 });
    assert.equal(created.status, 201);

    const { agent: admin } = await signedIn({ email: "admin@example.com" }).catch(async () => {
      const a = request.agent(app);
      await a.post("/api/auth/login").send({ email: "admin@example.com", password: "secret123" });
      return { agent: a };
    });
    const id = created.body.request._id;
    assert.equal((await admin.patch(`/api/bank/processBankrequest/${id}`).send({ action: "maybe" })).status, 400);
    assert.equal((await admin.patch(`/api/bank/processBankrequest/${id}`).send({ action: "accepted" })).status, 200);
    assert.equal((await Bank.findById(bank._id)).bloodInventory.O_positive, 2);

    // The request is kept, so the user can see it was accepted.
    const mine = await user.get("/api/bank/getUserBankRequest");
    assert.equal(mine.body[0].status, "accepted");
    assert.equal(mine.body[0].bank.name, bank.name);
  });
});

describe("notifications & messages", () => {
  test("you can't delete someone else's notification", async () => {
    const { agent: admin } = await (async () => {
      const a = request.agent(app);
      const r = await a.post("/api/auth/login").send({ email: "admin@example.com", password: "secret123" });
      if (r.status !== 200) return signedIn({ email: "admin@example.com" });
      return { agent: a };
    })();
    const bank = await Bank.create({ name: `Notify Bank ${Date.now()}`, location: { latitude: 23.8, longitude: 90.4 } });
    const { agent: user } = await signedIn();
    await user.post("/api/bank/createbankrequest").send({ bank: bank._id, bloodgroup: "A+", quantity: 1 });
    const notes = (await admin.get("/api/notification/getNotifications")).body;
    assert.ok(notes.length > 0);
    assert.match(notes[0].message, /Notify Bank/); // bank name, not a database id
    const res = await user.delete(`/api/notification/deleteSingleNotification/${notes[0]._id}`);
    assert.equal(res.status, 404);
  });

  test("messages are validated", async () => {
    const { agent, user } = await signedIn();
    const { user: other } = await signedIn();
    assert.equal((await agent.post("/api/messages").send({ receiverId: user._id, text: "hi" })).status, 400);
    assert.equal((await agent.post("/api/messages").send({ receiverId: other._id, text: "   " })).status, 400);
    assert.equal((await agent.post("/api/messages").send({ receiverId: other._id, text: "Hello!" })).status, 201);
    const convo = await agent.get(`/api/messages/${other._id}`);
    assert.equal(convo.body.length, 1);
  });
});

// Real MongoDB only (FerretDB has no geospatial support). Runs in GitHub Actions CI.
describe("donor search", { skip: process.env.SKIP_GEO_TESTS === "true" }, () => {
  test("finds nearby donors with the right blood group, nearest first, excluding yourself", async () => {
    const { agent } = await signedIn({ bloodGroup: "B-", latitude: 23.81, longitude: 90.41 });
    await signedIn({ name: "Near", bloodGroup: "B-", latitude: 23.812, longitude: 90.412 });
    await signedIn({ name: "Far", bloodGroup: "B-", latitude: 22.35, longitude: 91.78 }); // Chattogram
    await signedIn({ name: "Other group", bloodGroup: "A+", latitude: 23.811, longitude: 90.411 });
    const res = await agent.get("/api/searchFilter/filterDonors?bloodgroup=B-&latitude=23.81&longitude=90.41&maxDistance=5000");
    assert.equal(res.status, 200);
    assert.deepEqual(res.body.donors.map((d) => d.name), ["Near"]);
  });
});

describe("server", () => {
  test("health check reports the database", async () => {
    const res = await request(app).get("/api/health");
    assert.equal(res.status, 200);
    assert.equal(res.body.database, "connected");
  });

  test("unknown API routes return JSON 404", async () => {
    const res = await request(app).get("/api/nope");
    assert.equal(res.status, 404);
    assert.equal(res.body.message, "Not found");
  });
});
