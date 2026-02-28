import { useState } from "react";
import { DndContext, closestCenter } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import { useTasks } from "./hooks/useTasks";
import TaskItem from "./components/TaskItem";
import AuthForm from "./components/AuthForm";
import AddTaskForm from "./components/AddTaskForm";
import { api } from "./api";

function App() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(
    !!localStorage.getItem("token")
  );
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [authLoading, setAuthLoading] = useState(false);

  const [title, setTitle] = useState("");
  const [priority, setPriority] =
    useState<"low" | "medium" | "high" | null>(null);
  const [dueDate, setDueDate] = useState("");

  const {
    tasks,
    addTask,
    toggleTask,
    deleteTask,
    reorderTasks,
    loading,
  } = useTasks(isLoggedIn);

  const register = async () => {
    try {
      setAuthLoading(true);

      await api.post("/auth/register", { email, password });
      setIsRegisterMode(false);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.error || "Registration failed");
    } finally {
      setAuthLoading(false);
    }
  };

  const login = async () => {
    try {
      setAuthLoading(true);

      const res = await api.post("/auth/login", {
        email,
        password,
      });

      localStorage.setItem("token", res.data.token);
      setIsLoggedIn(true);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.error || "Login failed");
    } finally {
      setAuthLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const isWithinThreeDays = (dateString?: string) => {
    if (!dateString) return false;

    const due = new Date(dateString);
    due.setHours(0, 0, 0, 0);

    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.floor(
      diffTime / (1000 * 60 * 60 * 24)
    );

    return diffDays >= 0 && diffDays <= 3;
  };

  const urgentTasks = tasks.filter(
    (task) =>
      !task.completed &&
      task.dueDate &&
      isWithinThreeDays(task.dueDate)
  );

  const normalTasks = tasks.filter(
    (task) =>
      !task.completed &&
      !urgentTasks.some((t) => t._id === task._id)
  );

  const completedTasks = tasks.filter((t) => t.completed);

  if (!isLoggedIn) {
    return (
      <AuthForm
        email={email}
        setEmail={setEmail}
        password={password}
        setPassword={setPassword}
        isRegisterMode={isRegisterMode}
        setIsRegisterMode={setIsRegisterMode}
        error={error}
        loading={authLoading}
        onSubmit={isRegisterMode ? register : login}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-slate-900 to-black text-white">
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-black/40 border-b border-white/10">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-3 px-4 sm:px-6 py-4">
          <h1 className="text-2xl font-bold">Your Tasks</h1>
          <button
            onClick={logout}
            className="bg-red-500 px-4 py-2 rounded hover:bg-red-600 transition"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-6">
        <AddTaskForm
          title={title}
          setTitle={setTitle}
          priority={priority}
          setPriority={setPriority}
          dueDate={dueDate}
          setDueDate={setDueDate}
          onAdd={() => addTask(title, priority, dueDate)}
          loading={loading}
        />

        {urgentTasks.length > 0 && (
          <>
            <h3 className="text-red-400 text-sm uppercase tracking-wider mb-3">
              Urgent (Next 3 Days)
            </h3>
            <div className="space-y-3 mb-8">
              {urgentTasks.map((task) => (
                <TaskItem
                  key={task._id}
                  task={task}
                  toggleTask={toggleTask}
                  deleteTask={deleteTask}
                  disableDrag
                />
              ))}
            </div>
          </>
        )}

        {normalTasks.length > 0 && (
          <DndContext
            collisionDetection={closestCenter}
            onDragEnd={reorderTasks}
          >
            <SortableContext
              items={normalTasks.map((t) => t._id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-3">
                {normalTasks.map((task) => (
                  <TaskItem
                    key={task._id}
                    task={task}
                    toggleTask={toggleTask}
                    deleteTask={deleteTask}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}

        {completedTasks.length > 0 && (
          <div className="pt-8">
            <h3 className="text-slate-400 text-sm uppercase tracking-wider mb-3">
              Completed
            </h3>
            <div className="space-y-3">
              {completedTasks.map((task) => (
                <TaskItem
                  key={task._id}
                  task={task}
                  toggleTask={toggleTask}
                  deleteTask={deleteTask}
                  disableDrag
                />
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;