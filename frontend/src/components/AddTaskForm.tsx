import type { Dispatch, SetStateAction } from "react";

interface Props {
  title: string;
  setTitle: Dispatch<SetStateAction<string>>;

  priority: "low" | "medium" | "high" | null;
  setPriority: Dispatch<SetStateAction<"low" | "medium" | "high" | null>>;

  dueDate: string;
  setDueDate: Dispatch<SetStateAction<string>>;

  onAdd: () => void;
  loading: boolean;
}

export default function AddTaskForm({
  title,
  setTitle,
  priority,
  setPriority,
  dueDate,
  setDueDate,
  onAdd,
  loading,
}: Props) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 mb-6">
      <input
        className="w-full sm:flex-1 p-3 bg-white/20 rounded"
        placeholder="Add task..."
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        disabled={loading}
      />

      <select
        value={priority ?? ""}
        onChange={(e) =>
          setPriority(
            e.target.value === ""
              ? null
              : (e.target.value as "low" | "medium" | "high"),
          )
        }
        disabled={loading}
        className="bg-slate-800 text-white px-3 py-3 rounded border border-white/20"
      >
        <option value="">No Priority</option>
        <option value="low">Low</option>
        <option value="medium">Medium</option>
        <option value="high">High</option>
      </select>

      <input
        type="date"
        value={dueDate}
        onChange={(e) => setDueDate(e.target.value)}
        disabled={loading}
        className="bg-slate-800 text-white px-3 py-3 rounded border border-white/20"
      />

      <button
        onClick={onAdd}
        disabled={loading || !title.trim()}
        className={`relative w-full sm:w-auto px-6 py-3 rounded transition flex items-center justify-center gap-2
    ${
      loading
        ? "bg-gray-500 cursor-not-allowed"
        : "bg-green-600 hover:bg-green-700"
    }
  `}
      >
        {loading && (
          <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
        )}
        <span>{loading ? "Adding..." : "Add"}</span>
      </button>
    </div>
  );
}
