import { useEffect, useState } from "react";
import { api } from "./api";

type Task = {
  _id: string;
  title: string;
  completed: boolean;
};

const Spinner = () => (
  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
);

function App() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(
    !!localStorage.getItem("token")
  );
  const [isRegisterMode, setIsRegisterMode] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<"all" | "active" | "completed">("all");

  const showSuccess = (message: string) => {
    setSuccess(message);
    setTimeout(() => setSuccess(null), 3000);
  };

  const validateAuth = () => {
    setError(null);
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address");
      return false;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return false;
    }

    return true;
  };

  const register = async () => {
    if (!validateAuth()) return;

    try {
      setLoading(true);
      await api.post("/auth/register", { email, password });
      showSuccess("Account created successfully");
      setIsRegisterMode(false);
    } catch (err: any) {
      setError(err.response?.data?.error || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const login = async () => {
    if (!validateAuth()) return;

    try {
      setLoading(true);
      const res = await api.post("/auth/login", { email, password });
      localStorage.setItem("token", res.data.token);
      setIsLoggedIn(true);
      showSuccess("Logged in successfully");
    } catch (err: any) {
      setError(err.response?.data?.error || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    setTasks([]);
    showSuccess("Logged out");
  };

  const fetchTasks = async () => {
    const res = await api.get("/tasks");
    setTasks(res.data);
  };

  const addTask = async () => {
    if (!title.trim()) return;

    try {
      setLoading(true);
      await api.post("/tasks", { title });
      setTitle("");
      fetchTasks();
      showSuccess("Task added");
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to add task");
    } finally {
      setLoading(false);
    }
  };

  const toggleTask = async (task: Task) => {
    await api.put(`/tasks/${task._id}`, {
      completed: !task.completed,
    });
    fetchTasks();
  };

  const deleteTask = async (id: string) => {
    if (!confirm("Delete this task?")) return;
    await api.delete(`/tasks/${id}`);
    fetchTasks();
    showSuccess("Task deleted");
  };

  useEffect(() => {
    if (isLoggedIn) fetchTasks();
  }, [isLoggedIn]);

  const total = tasks.length;
  const completed = tasks.filter((t) => t.completed).length;
  const active = total - completed;

  const filteredTasks = tasks.filter((task) => {
    if (filter === "active") return !task.completed;
    if (filter === "completed") return task.completed;
    return true;
  });

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 via-slate-900 to-black">
        <div className="bg-white/10 backdrop-blur-xl p-10 rounded-2xl shadow-2xl w-full max-w-md border border-white/20">
          <h2 className="text-3xl font-bold mb-6 text-center text-white">
            Task Manager
          </h2>

          {error && (
            <div className="bg-red-500/20 text-red-300 p-3 mb-4 rounded-lg text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-500/20 text-green-300 p-3 mb-4 rounded-lg text-sm">
              {success}
            </div>
          )}

          <input
            className="w-full bg-white/20 text-white placeholder-slate-300 border border-white/30 p-3 mb-4 rounded-lg"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            className="w-full bg-white/20 text-white placeholder-slate-300 border border-white/30 p-3 mb-6 rounded-lg"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            disabled={loading}
            className="w-full bg-indigo-500 text-white py-3 rounded-lg hover:bg-indigo-600 transition disabled:opacity-50 flex items-center justify-center"
            onClick={isRegisterMode ? register : login}
          >
            {loading ? <Spinner /> : isRegisterMode ? "Register" : "Login"}
          </button>

          <p className="text-center text-sm text-slate-300 mt-6">
            {isRegisterMode
              ? "Already have an account?"
              : "Don't have an account?"}
            <button
              onClick={() => {
                setError(null);
                setSuccess(null);
                setIsRegisterMode(!isRegisterMode);
              }}
              className="ml-2 text-indigo-400 hover:underline"
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
      <header className="bg-white/10 backdrop-blur-md border-b border-white/20 px-8 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Your Tasks</h1>
        <button
          onClick={logout}
          className="bg-red-500 px-4 py-2 rounded-lg hover:bg-red-600 transition"
        >
          Logout
        </button>
      </header>

      <main className="max-w-2xl mx-auto p-8">

        <div className="flex justify-between items-center mb-6 text-sm text-slate-300">
          <div>
            <span className="mr-4">Total: {total}</span>
            <span className="mr-4">Active: {active}</span>
            <span>Completed: {completed}</span>
          </div>

          <div className="flex gap-2">
            {["all", "active", "completed"].map((type) => (
              <button
                key={type}
                onClick={() =>
                  setFilter(type as "all" | "active" | "completed")
                }
                className={`px-3 py-1 rounded-md text-xs capitalize transition ${
                  filter === type
                    ? "bg-indigo-500 text-white"
                    : "bg-white/10 hover:bg-white/20"
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-3 mb-8">
          <input
            className="flex-1 bg-white/20 border border-white/30 p-3 rounded-lg placeholder-slate-300"
            placeholder="Add a new task..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <button
            disabled={loading}
            className="bg-green-600 px-6 rounded-lg hover:bg-green-700 transition disabled:opacity-50 flex items-center justify-center"
            onClick={addTask}
          >
            {loading ? <Spinner /> : "Add"}
          </button>
        </div>

        <div className="space-y-4">

          {filter === "all" && (
            <>
              {tasks.filter(t => !t.completed).map((task) => (
                <TaskItem
                  key={task._id}
                  task={task}
                  toggleTask={toggleTask}
                  deleteTask={deleteTask}
                />
              ))}

              {completed > 0 && (
                <div className="pt-6">
                  <h3 className="text-slate-400 text-sm uppercase tracking-wider mb-3">
                    Completed
                  </h3>

                  {tasks.filter(t => t.completed).map((task) => (
                    <TaskItem
                      key={task._id}
                      task={task}
                      toggleTask={toggleTask}
                      deleteTask={deleteTask}
                      completedStyle
                    />
                  ))}
                </div>
              )}
            </>
          )}

          {filter !== "all" &&
            filteredTasks.map((task) => (
              <TaskItem
                key={task._id}
                task={task}
                toggleTask={toggleTask}
                deleteTask={deleteTask}
                completedStyle={task.completed}
              />
            ))}
        </div>
      </main>
    </div>
  );
}

function TaskItem({
  task,
  toggleTask,
  deleteTask,
  completedStyle = false,
}: any) {
  return (
    <div className="bg-white/10 backdrop-blur-md border border-white/20 p-5 rounded-xl flex justify-between items-center hover:bg-white/20 transition">
      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          checked={task.completed}
          onChange={() => toggleTask(task)}
          className="w-5 h-5 accent-indigo-500 cursor-pointer"
        />
        <span
          className={`text-lg ${
            completedStyle ? "line-through text-slate-400" : ""
          }`}
        >
          {task.title}
        </span>
      </div>

      <button
        onClick={() => deleteTask(task._id)}
        className="text-red-400 hover:text-red-500 transition"
      >
        Delete
      </button>
    </div>
  );
}

export default App;