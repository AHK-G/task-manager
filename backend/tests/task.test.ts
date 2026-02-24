import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { app } from "../src/app";

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe("Task API", () => {

  it("should fail when title is missing", async () => {
  const res = await request(app)
    .post("/tasks")
    .send({});

  expect(res.status).toBe(400);
  expect(res.body.error).toBeDefined();
});
it("should fail when title contains only whitespace", async () => {
  const res = await request(app)
    .post("/tasks")
    .send({ title: "   " });

  expect(res.status).toBe(400);
});
it("should create a task successfully", async () => {
  const res = await request(app)
    .post("/tasks")
    .send({ title: "My Task" });

  expect(res.status).toBe(201);
  expect(res.body.title).toBe("My Task");
  expect(res.body.completed).toBe(false);
});

it("should return all tasks", async () => {
  await request(app)
    .post("/tasks")
    .send({ title: "Task 1" });

  const res = await request(app).get("/tasks");

  expect(res.status).toBe(200);
  expect(Array.isArray(res.body)).toBe(true);
});

it("should update a task", async () => {
  const create = await request(app)
    .post("/tasks")
    .send({ title: "Update Me" });

  const res = await request(app)
    .put(`/tasks/${create.body._id}`)
    .send({ completed: true });

  expect(res.status).toBe(200);
  expect(res.body.completed).toBe(true);
});
it("should return 404 for non-existent task update", async () => {
  const fakeId = new mongoose.Types.ObjectId();

  const res = await request(app)
    .put(`/tasks/${fakeId}`)
    .send({ completed: true });

  expect(res.status).toBe(404);
});
it("should return 404 for non-existent task delete", async () => {
  const fakeId = new mongoose.Types.ObjectId();

  const res = await request(app).delete(`/tasks/${fakeId}`);

  expect(res.status).toBe(404);
});
});