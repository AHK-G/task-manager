import { useEffect, useState } from "react";
import { api } from "../api";
import { arrayMove } from "@dnd-kit/sortable";
import type { Task } from "../types/task";

export function useTasks(isLoggedIn: boolean) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const res = await api.get("/tasks");
      setTasks(res.data);
    } catch (error) {
      console.error("Failed to fetch tasks", error);
    } finally {
      setLoading(false);
    }
  };

  const addTask = async (
    title: string,
    priority: "low" | "medium" | "high" | null,
    dueDate: string
  ) => {
    if (!title.trim()) return;

    try {
      setLoading(true);

      const res = await api.post("/tasks", {
        title,
        priority: priority || undefined,
        dueDate: dueDate || undefined,
      });

      setTasks((prev) => [...prev, res.data]);
    } catch (error) {
      console.error("Failed to add task", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleTask = async (task: Task): Promise<void> => {
    try {
      setLoading(true);

      const res = await api.put(`/tasks/${task._id}`, {
        completed: !task.completed,
      });

      setTasks((prev) =>
        prev.map((t) => (t._id === task._id ? res.data : t))
      );
    } catch (error) {
      console.error("Failed to toggle task", error);
    } finally {
      setLoading(false);
    }
  };

  const deleteTask = async (id: string): Promise<void> => {
    try {
      setLoading(true);

      await api.delete(`/tasks/${id}`);
      setTasks((prev) => prev.filter((t) => t._id !== id));
    } catch (error) {
      console.error("Failed to delete task", error);
    } finally {
      setLoading(false);
    }
  };

  const reorderTasks = async (event: any) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = tasks.findIndex((t) => t._id === active.id);
    const newIndex = tasks.findIndex((t) => t._id === over.id);

    const newTasks = arrayMove(tasks, oldIndex, newIndex);
    setTasks(newTasks);

    try {
      setLoading(true);

      await api.put("/tasks/reorder", {
        tasks: newTasks.map((task, index) => ({
          id: task._id,
          order: index,
        })),
      });
    } catch (error) {
      console.error("Failed to reorder tasks", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      fetchTasks();
    } else {
      setTasks([]);
    }
  }, [isLoggedIn]);

  return {
    tasks,
    loading,
    addTask,
    toggleTask,
    deleteTask,
    reorderTasks,
  };
}