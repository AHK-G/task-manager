import { Request, Response, NextFunction } from "express";
import Task from "../models/Task";
import { AppError } from "../utils/AppError";

export const getTasks = async (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const tasks = await Task.find().sort({ createdAt: -1 });
    res.json(tasks);
  } catch (error) {
    next(error);
  }
};

export const createTask = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { title } = req.body;

    if (!title || title.trim() === "") {
      throw new AppError("Title is required", 400);
    }

    const task = await Task.create({ title });

    res.status(201).json(task);
  } catch (error) {
    next(error);
  }
};

export const updateTask = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { completed } = req.body;

    const task = await Task.findByIdAndUpdate(
      req.params.id,
      { completed },
      { returnDocument: "after" }
    );

    if (!task) {
      throw new AppError("Task not found", 404);
    }

    res.json(task);
  } catch (error) {
    next(error);
  }
};

export const deleteTask = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);

    if (!task) {
      throw new AppError("Task not found", 404);
    }

    res.json({ message: "Task deleted" });
  } catch (error) {
    next(error);
  }
};