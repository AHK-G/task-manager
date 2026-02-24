import express from "express";
import taskRoutes from "./routes/task.routes";

export const app = express();

app.use(express.json());

app.use("/tasks", taskRoutes);