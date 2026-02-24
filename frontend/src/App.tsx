import { useEffect, useState } from "react";
import { api } from "./api";

type Task = {
  _id: string;
  title: string;
  completed: boolean;
};

export default function App() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(
    !!localStorage.getItem("token")
  );

  const register = async () => {
    await api.post("/auth/register", { email, password });
    alert("Registered! Now login.");
  };

  const login = async () => {
    const res = await api.post("/auth/login", { email, password });
    localStorage.setItem("token", res.data.token);
    setIsLoggedIn(true);
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
    await api.delete(`/tasks/${id}`);
    fetchTasks();
  };

  useEffect(() => {
    if (isLoggedIn) fetchTasks();
  }, [isLoggedIn]);

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-white w-full max-w-sm p-8 rounded-xl shadow-md">
          <h2 className="text-2xl font-bold text-center mb-6">
            Login / Register
          </h2>

          <input
            className="w-full border p-2 rounded mb-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            className="w-full border p-2 rounded mb-4 focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <div className="flex gap-2">
            <button
              onClick={login}
              className="flex-1 bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition"
            >
              Login
            </button>

            <button
              onClick={register}
              className="flex-1 bg-gray-500 text-white py-2 rounded hover:bg-gray-600 transition"
            >
              Register
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex justify-center p-6">
      <div className="bg-white w-full max-w-xl p-8 rounded-xl shadow-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Task Manager</h2>
          <button
            onClick={logout}
            className="text-sm text-red-500 hover:underline"
          >
            Logout
          </button>
        </div>

        <div className="flex gap-2 mb-6">
          <input
            className="flex-1 border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="New Task"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <button
            onClick={addTask}
            className="bg-blue-500 text-white px-4 rounded hover:bg-blue-600 transition"
          >
            Add
          </button>
        </div>

        <ul className="space-y-3">
          {tasks.map((task) => (
            <li
              key={task._id}
              className="flex justify-between items-center bg-gray-50 p-3 rounded"
            >
              <span
                onClick={() => toggleTask(task)}
                className={`cursor-pointer ${
                  task.completed
                    ? "line-through text-gray-400"
                    : ""
                }`}
              >
                {task.title}
              </span>

              <button
                onClick={() => deleteTask(task._id)}
                className="text-red-500 hover:text-red-700"
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}