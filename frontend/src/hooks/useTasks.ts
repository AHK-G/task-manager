import { useEffect, useState } from "react";
import { api } from "../api";
import { arrayMove } from "@dnd-kit/sortable";
import type { Task } from "../types/task";

export function useTasks(isLoggedIn: boolean) {
  const [tasks, setTasks] = useState<Task[]>([]);

  const fetchTasks = async () => {
    const res = await api.get("/tasks");
    setTasks(res.data);
  };

  const addTask = async (
    title: string,
    priority: "low" | "medium" | "high",
    dueDate: string
  ) => {
    if (!title.trim()) return;

    const res = await api.post("/tasks", {
      title,
      priority,
      dueDate: dueDate || undefined,
    });

    setTasks((prev) => [...prev, res.data]);
  };

  const toggleTask = async (task: Task) => {
    const res = await api.put(`/tasks/${task._id}`, {
      completed: !task.completed,
    });

    setTasks((prev) =>
      prev.map((t) => (t._id === task._id ? res.data : t))
    );
  };

  const deleteTask = async (id: string) => {
    await api.delete(`/tasks/${id}`);
    setTasks((prev) => prev.filter((t) => t._id !== id));
  };

  const reorderTasks = async (event: any) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = tasks.findIndex((t) => t._id === active.id);
    const newIndex = tasks.findIndex((t) => t._id === over.id);

    const newTasks = arrayMove(tasks, oldIndex, newIndex);
    setTasks(newTasks);

    await api.put("/tasks/reorder", {
      tasks: newTasks.map((task, index) => ({
        id: task._id,
        order: index,
      })),
    });
  };

  useEffect(() => {
    if (isLoggedIn) fetchTasks();
  }, [isLoggedIn]);

  return {
    tasks,
    setTasks,
    addTask,
    toggleTask,
    deleteTask,
    reorderTasks,
  };
}