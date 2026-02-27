import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { app } from "../src/app";
import dotenv from "dotenv";

let mongoServer: MongoMemoryServer;
let token: string;
dotenv.config()

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
  console.log("JWT_SECRET in test:", process.env.JWT_SECRET);

  await request(app).post("/auth/register").send({
    email: "test@example.com",
    password: "password123",
  });

  const loginRes = await request(app).post("/auth/login").send({
    email: "test@example.com",
    password: "password123",
  });

  token = loginRes.body.token;
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe("Task API (Authenticated)", () => {
  it("should fail when title is missing", async () => {
    const res = await request(app)
      .post("/tasks")
      .set("Authorization", `Bearer ${token}`)
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
  });

  it("should fail when title contains only whitespace", async () => {
    const res = await request(app)
      .post("/tasks")
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "   " });

    expect(res.status).toBe(400);
  });

  it("should create a task successfully", async () => {
    const res = await request(app)
      .post("/tasks")
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "My Task" });

    expect(res.status).toBe(201);
    expect(res.body.title).toBe("My Task");
    expect(res.body.completed).toBe(false);
  });

  it("should return all tasks", async () => {
    await request(app)
      .post("/tasks")
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Task 1" });

    const res = await request(app)
      .get("/tasks")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it("should update a task", async () => {
    const create = await request(app)
      .post("/tasks")
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Update Me" });

    const res = await request(app)
      .put(`/tasks/${create.body._id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ completed: true });

    expect(res.status).toBe(200);
    expect(res.body.completed).toBe(true);
  });

  it("should return 404 for non-existent task update", async () => {
    const fakeId = new mongoose.Types.ObjectId();

    const res = await request(app)
      .put(`/tasks/${fakeId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ completed: true });

    expect(res.status).toBe(404);
  });

  it("should return 404 for non-existent task delete", async () => {
    const fakeId = new mongoose.Types.ObjectId();

    const res = await request(app)
      .delete(`/tasks/${fakeId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(404);
  });

  it("should return 401 without token", async () => {
    const res = await request(app).get("/tasks");

    expect(res.status).toBe(401);
  });

  it("should fail with invalid token", async () => {
  const res = await request(app)
    .get("/tasks")
    .set("Authorization", "Bearer invalidtoken");

  expect(res.status).toBe(401);
});
  
it("should fail reorder with invalid payload", async () => {
  const res = await request(app)
    .put("/tasks/reorder")
    .set("Authorization", `Bearer ${token}`)
    .send({ tasks: "not-an-array" });

  expect(res.status).toBe(400);
});

it("should ignore invalid priority updates", async () => {
  const create = await request(app)
    .post("/tasks")
    .set("Authorization", `Bearer ${token}`)
    .send({ title: "Priority Test" });

  const res = await request(app)
    .put(`/tasks/${create.body._id}`)
    .set("Authorization", `Bearer ${token}`)
    .send({ priority: "invalid-priority" });

  expect(res.status).toBe(200);
  expect(res.body.priority).not.toBe("invalid-priority");
});
});