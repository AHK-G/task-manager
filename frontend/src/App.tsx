import { useEffect, useState } from "react";
import { api } from "./api";

type Task = {
  _id: string;
  title: string;
  completed: boolean;
};

function App() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(
    !!localStorage.getItem("token")
  );
  const [isRegisterMode, setIsRegisterMode] = useState(false);

  const register = async () => {
    try {
      await api.post("/auth/register", { email, password });
      alert("Registered! You can now login.");
      setIsRegisterMode(false);
    } catch (err: any) {
      alert(err.response?.data?.error || "Registration failed");
    }
  };

  const login = async () => {
    try {
      const res = await api.post("/auth/login", { email, password });
      localStorage.setItem("token", res.data.token);
      setIsLoggedIn(true);
    } catch (err: any) {
      alert(err.response?.data?.error || "Login failed");
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
    await api.post("/tasks", { title });
    setTitle("");
    fetchTasks();
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
  };

  useEffect(() => {
    if (isLoggedIn) {
      fetchTasks();
    }
  }, [isLoggedIn]);


  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 via-slate-900 to-black">
        <div className="bg-white/10 backdrop-blur-xl p-10 rounded-2xl shadow-2xl w-full max-w-md border border-white/20">
          <h2 className="text-3xl font-bold mb-2 text-center text-white">
            Task Manager
          </h2>

          <p className="text-center text-slate-300 mb-8">
            {isRegisterMode
              ? "Create your account"
              : "Welcome back"}
          </p>

          <input
            className="w-full bg-white/20 text-white placeholder-slate-300 border border-white/30 p-3 mb-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            className="w-full bg-white/20 text-white placeholder-slate-300 border border-white/30 p-3 mb-6 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            className="w-full bg-indigo-500 text-white py-3 rounded-lg font-medium hover:bg-indigo-600 transition"
            onClick={isRegisterMode ? register : login}
          >
            {isRegisterMode ? "Register" : "Login"}
          </button>

          <p className="text-center text-sm text-slate-300 mt-6">
            {isRegisterMode
              ? "Already have an account?"
              : "Don't have an account?"}
            <button
              onClick={() => setIsRegisterMode(!isRegisterMode)}
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
        <div className="flex gap-3 mb-8">
          <input
            className="flex-1 bg-white/20 border border-white/30 p-3 rounded-lg placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-green-400"
            placeholder="Add a new task..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <button
            className="bg-green-600 px-6 rounded-lg hover:bg-green-700 transition"
            onClick={addTask}
          >
            Add
          </button>
        </div>

        {tasks.length === 0 && (
          <div className="text-center text-slate-300 mt-16 text-lg">
            No tasks yet. Start building your productivity 🚀
          </div>
        )}

        <div className="space-y-4">
          {tasks.map((task) => (
            <div
              key={task._id}
              className="bg-white/10 backdrop-blur-md border border-white/20 p-5 rounded-xl flex justify-between items-center hover:bg-white/20 transition"
            >
              <span
                onClick={() => toggleTask(task)}
                className={`cursor-pointer text-lg ${
                  task.completed
                    ? "line-through text-slate-400"
                    : "text-white"
                }`}
              >
                {task.title}
              </span>

              <button
                onClick={() => deleteTask(task._id)}
                className="text-red-400 hover:text-red-500 transition"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

export default App;