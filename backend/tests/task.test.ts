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
});