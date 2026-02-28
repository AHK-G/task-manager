import { useEffect, useState } from "react";
import { api } from "../api";
import { arrayMove } from "@dnd-kit/sortable";
import { toast } from "react-hot-toast";
import type { Task } from "../types/task";

export function useTasks(isLoggedIn: boolean) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchTasks = async () => {
    try {
      const res = await api.get("/tasks");
      setTasks(res.data);
    } catch (error) {
      toast.error("Failed to fetch tasks");
    }
  };

  const addTask = async (
    title: string,
    priority: "low" | "medium" | "high" | null,
    dueDate: string,
  ) => {
    if (!title.trim()) return;

    try {
      setLoading(true);

      const res = await api.post("/tasks", {
        title,
        priority: priority ?? undefined,
        dueDate: dueDate || undefined,
      });

      setTasks((prev) => [...prev, res.data]);

      toast.success("Task created successfully");
    } catch (error) {
      toast.error("Failed to create task");
    } finally {
      setLoading(false);
    }
  };

  const toggleTask = async (task: Task) => {
    try {
      const res = await api.put(`/tasks/${task._id}`, {
        completed: !task.completed,
      });

      setTasks((prev) => prev.map((t) => (t._id === task._id ? res.data : t)));

      toast.success(
        res.data.completed ? "Task completed" : "Task marked active",
      );
    } catch (error) {
      toast.error("Failed to update task");
    }
  };

  const deleteTask = async (id: string) => {
    try {
      await api.delete(`/tasks/${id}`);

      setTasks((prev) => prev.filter((t) => t._id !== id));

      toast.success("Task deleted");
    } catch (error) {
      toast.error("Failed to delete task");
    }
  };

  const updateTaskTitle = async (id: string, title: string) => {
    try {
      const res = await api.put(`/tasks/${id}`, { title });

      setTasks((prev) => prev.map((t) => (t._id === id ? res.data : t)));

      toast.success("Task updated");
    } catch {
      toast.error("Failed to update task");
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
      await api.put("/tasks/reorder", {
        tasks: newTasks.map((task, index) => ({
          id: task._id,
          order: index,
        })),
      });
    } catch (error) {
      toast.error("Failed to reorder tasks");
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
    updateTaskTitle,
  };
}
