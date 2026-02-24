import express from "express";
import taskRoutes from "./routes/task.routes";
import { errorHandler } from "./middleware/error.middleware";

export const app = express();

app.use(express.json());

app.use("/tasks", taskRoutes);

app.use(errorHandler);