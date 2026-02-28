import express from "express";
import cors from "cors";
import taskRoutes from "./routes/task.routes";
import { errorHandler } from "./middleware/error.middleware";
import authRoutes from "./routes/auth.routes";
import { authMiddleware } from "./middleware/auth.middleware";

export const app = express();

app.get("/", (_req, res) => {
  res.json({ message: "API is running 🚀" });
});

app.use(express.json());

app.use(
  cors({
    origin: true,
    credentials: true,
  }),
);

app.use("/auth", authRoutes);
app.use("/tasks", authMiddleware, taskRoutes);

app.use(errorHandler);
