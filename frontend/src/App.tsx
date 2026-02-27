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
  // ================= AUTH =================
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(
    !!localStorage.getItem("token")
  );
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ================= TASK FORM =================
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState<
    "low" | "medium" | "high"
  >("medium");
  const [dueDate, setDueDate] = useState("");

  // ================= TASK HOOK =================
  const {
    tasks,
    addTask,
    toggleTask,
    deleteTask,
    reorderTasks,
  } = useTasks(isLoggedIn);

  // ================= AUTH FUNCTIONS =================
  const register = async () => {
    try {
      await api.post("/auth/register", { email, password });
      setIsRegisterMode(false);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.error || "Registration failed");
    }
  };

  const login = async () => {
    try {
      const res = await api.post("/auth/login", {
        email,
        password,
      });
      localStorage.setItem("token", res.data.token);
      setIsLoggedIn(true);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.error || "Login failed");
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
  };

  // ================= URGENT GROUPING =================
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

  // ================= AUTH VIEW =================
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
        onSubmit={isRegisterMode ? register : login}
      />
    );
  }

  // ================= MAIN =================
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-slate-900 to-black text-white">
      <header className="flex justify-between items-center p-6">
        <h1 className="text-2xl font-bold">Your Tasks</h1>
        <button
          onClick={logout}
          className="bg-red-500 px-4 py-2 rounded"
        >
          Logout
        </button>
      </header>

      <main className="max-w-2xl mx-auto p-6">
        <AddTaskForm
          title={title}
          setTitle={setTitle}
          priority={priority}
          setPriority={setPriority}
          dueDate={dueDate}
          setDueDate={setDueDate}
          onAdd={() => {
            addTask(title, priority, dueDate);
            setTitle("");
            setPriority("medium");
            setDueDate("");
          }}
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