import express, { Request, Response } from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import Task from "./models/Task";

dotenv.config();

export const app = express();

app.use(express.json());

/**
 * MongoDB Connection
 */
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI as string);
    console.log("MongoDB Connected ✅");
  } catch (error) {
    console.error("MongoDB connection failed:", error);
    process.exit(1);
  }
};

// Only connect if not running tests
if (process.env.NODE_ENV !== "test") {
  connectDB();
}

/**
 * Routes
 */

// GET all tasks
app.get("/tasks", async (_req: Request, res: Response) => {
  try {
    const tasks = await Task.find().sort({ createdAt: -1 });
    res.json(tasks);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// CREATE task
app.post("/tasks", async (req: Request, res: Response) => {
  try {
    const { title } = req.body;

    if (!title) {
      return res.status(400).json({ error: "Title is required" });
    }

    const task = new Task({ title });
    await task.save();

    res.status(201).json(task);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// UPDATE task
app.put("/tasks/:id", async (req: Request, res: Response) => {
  try {
    const { completed } = req.body;

    const task = await Task.findByIdAndUpdate(
      req.params.id,
      { completed },
      { new: true }
    );

    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }

    res.json(task);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// DELETE task
app.delete("/tasks/:id", async (req: Request, res: Response) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);

    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }

    res.json({ message: "Task deleted" });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * Start Server (not during tests)
 */
if (process.env.NODE_ENV !== "test") {
  const PORT = process.env.PORT || 5000;

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT} 🚀`);
  });
}