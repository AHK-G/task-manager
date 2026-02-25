import { Request, Response, NextFunction } from "express";
import Task from "../models/Task";
import { AppError } from "../utils/AppError";

type AuthRequest = Request & { userId?: string };


export const getTasks = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const tasks = await Task.find({ user: req.userId }).sort({
      order: 1,
    });

    res.json(tasks);
  } catch (error) {
    next(error);
  }
};


export const createTask = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { title } = req.body;

    if (!title || title.trim() === "") {
      throw new AppError("Title is required", 400);
    }

    const lastTask = await Task.findOne({ user: req.userId })
      .sort({ order: -1 });

    const nextOrder = lastTask ? lastTask.order + 1 : 0;

    const task = await Task.create({
      title,
      user: req.userId,
      order: nextOrder,
    });

    res.status(201).json(task);
  } catch (error) {
    next(error);
  }
};


export const updateTask = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { completed, title } = req.body;

    const updateData: any = {};
    if (completed !== undefined) updateData.completed = completed;
    if (title !== undefined) updateData.title = title;

    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, user: req.userId },
      updateData,
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
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      user: req.userId,
    });

    if (!task) {
      throw new AppError("Task not found", 404);
    }

    res.json({ message: "Task deleted" });
  } catch (error) {
    next(error);
  }
};


export const reorderTasks = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { tasks } = req.body;

    if (!Array.isArray(tasks)) {
      throw new AppError("Invalid reorder payload", 400);
    }

    for (const item of tasks) {
      await Task.findOneAndUpdate(
        { _id: item.id, user: req.userId },
        { order: item.order }
      );
    }

    res.json({ message: "Order updated" });
  } catch (error) {
    next(error);
  }
};