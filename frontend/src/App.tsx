import { useEffect, useState } from "react";
import { api } from "./api";

import {
  DndContext,
  closestCenter,
} from "@dnd-kit/core";

import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";

import { CSS } from "@dnd-kit/utilities";

type Task = {
  _id: string;
  title: string;
  completed: boolean;
};

function App() {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(
    !!localStorage.getItem("token")
  );
  const [isRegisterMode, setIsRegisterMode] = useState(false);


  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState("");
  const [filter, setFilter] = useState<
    "all" | "active" | "completed"
  >("all");

  const [error, setError] = useState<string | null>(null);


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
    setTasks([]);
  };


  const fetchTasks = async () => {
    const res = await api.get("/tasks");
    setTasks(res.data);
  };

  const addTask = async () => {
    if (!title.trim()) return;

    const res = await api.post("/tasks", { title });
    setTasks((prev) => [...prev, res.data]);
    setTitle("");
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


  const handleDragEnd = async (event: any) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const oldIndex = tasks.findIndex(
      (t) => t._id === active.id
    );
    const newIndex = tasks.findIndex(
      (t) => t._id === over.id
    );

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


  const filteredTasks = tasks.filter((task) => {
    if (filter === "active") return !task.completed;
    if (filter === "completed") return task.completed;
    return true;
  });

  const total = tasks.length;
  const completed = tasks.filter((t) => t.completed).length;
  const active = total - completed;


  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 via-slate-900 to-black text-white">
        <div className="bg-white/10 backdrop-blur-xl p-8 rounded-xl w-full max-w-md">
          <h2 className="text-2xl mb-6 text-center">
            {isRegisterMode ? "Register" : "Login"}
          </h2>

          {error && (
            <div className="bg-red-500/20 p-3 rounded mb-4 text-sm">
              {error}
            </div>
          )}

          <input
            className="w-full p-3 mb-3 bg-white/20 rounded"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            className="w-full p-3 mb-6 bg-white/20 rounded"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            className="w-full bg-indigo-500 py-3 rounded mb-4"
            onClick={isRegisterMode ? register : login}
          >
            {isRegisterMode ? "Register" : "Login"}
          </button>

          <p className="text-center text-sm">
            {isRegisterMode
              ? "Already have an account?"
              : "Don't have an account?"}
            <button
              onClick={() => setIsRegisterMode(!isRegisterMode)}
              className="ml-2 underline"
            >
              {isRegisterMode ? "Login" : "Register"}
            </button>
          </p>
        </div>
      </div>
    );
  }

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

        <div className="flex justify-between mb-4 text-sm text-slate-300">
          <div>
            Total: {total} | Active: {active} | Completed: {completed}
          </div>

          <div className="flex gap-2">
            {["all", "active", "completed"].map((type) => (
              <button
                key={type}
                onClick={() =>
                  setFilter(type as any)
                }
                className={`px-3 py-1 rounded ${
                  filter === type
                    ? "bg-indigo-500"
                    : "bg-white/20"
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-3 mb-6">
          <input
            className="flex-1 p-3 bg-white/20 rounded"
            placeholder="Add task..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <button
            onClick={addTask}
            className="bg-green-600 px-6 rounded"
          >
            Add
          </button>
        </div>

        <DndContext
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={filteredTasks.map((t) => t._id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-3">
              {filteredTasks.map((task) => (
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
      </main>
    </div>
  );
}

function TaskItem({
  task,
  toggleTask,
  deleteTask,
}: any) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: task._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(task.title);
  const [saving, setSaving] = useState(false);

  const saveEdit = async () => {
    if (!editValue.trim()) {
      setEditValue(task.title);
      setIsEditing(false);
      return;
    }

    try {
      setSaving(true);
      await api.put(`/tasks/${task._id}`, {
        title: editValue,
      });
    } finally {
      setSaving(false);
      setIsEditing(false);
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className="group bg-white/10 backdrop-blur-md border border-white/20 p-5 rounded-xl flex justify-between items-center hover:bg-white/20 transition-all duration-300"
    >
      <div className="flex items-center gap-3 flex-1">

        <div
          {...listeners}
          className="cursor-grab text-slate-400 hover:text-white transition"
        >
          ☰
        </div>

        <input
          type="checkbox"
          checked={task.completed}
          onChange={() => toggleTask(task)}
          className="w-5 h-5 accent-indigo-500 cursor-pointer"
        />

        {isEditing ? (
          <input
            autoFocus
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={saveEdit}
            onKeyDown={(e) => {
              if (e.key === "Enter") saveEdit();
              if (e.key === "Escape") {
                setEditValue(task.title);
                setIsEditing(false);
              }
            }}
            className="flex-1 bg-white/20 border border-white/30 p-2 rounded-lg text-white outline-none"
          />
        ) : (
          <span
            onDoubleClick={() => setIsEditing(true)}
            className={`flex-1 text-lg transition-all ${
              task.completed
                ? "line-through text-slate-400"
                : "text-white"
            }`}
          >
            {task.title}
          </span>
        )}
      </div>

      <div
        className="flex items-center gap-4 ml-4 
        opacity-0 group-hover:opacity-100 
        transition-all duration-300"
      >
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="text-indigo-400 hover:text-indigo-300 transition"
            title="Edit task"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-9 h-9 transition-transform duration-200 group-hover:scale-110"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.232 5.232l3.536 3.536M9 11l6-6 3 3-6 6H9v-3z"
              />
            </svg>
          </button>
        )}

        {saving && (
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
        )}

        <button
          onClick={() => deleteTask(task._id)}
          className="text-red-400 hover:text-red-500 transition"
        >
          Delete
        </button>
      </div>
    </div>
  );
}

export default App;