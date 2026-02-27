import type { Dispatch, SetStateAction } from "react";

interface Props {
  title: string;
  setTitle: Dispatch<SetStateAction<string>>;
  priority: "low" | "medium" | "high";
  setPriority: Dispatch<
    SetStateAction<"low" | "medium" | "high">
  >;
  dueDate: string;
  setDueDate: Dispatch<SetStateAction<string>>;
  onAdd: () => void;
}

export default function AddTaskForm({
  title,
  setTitle,
  priority,
  setPriority,
  dueDate,
  setDueDate,
  onAdd,
}: Props) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 mb-6">
      <input
        className="w-full sm:flex-1 p-3 bg-white/20 rounded"
        placeholder="Add task..."
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <select
        value={priority}
        onChange={(e) =>
          setPriority(e.target.value as "low" | "medium" | "high")
        }
        className="bg-slate-800 text-white px-3 py-3 rounded border border-white/20"
      >
        <option value="low">Low</option>
        <option value="medium">Medium</option>
        <option value="high">High</option>
      </select>

      <input
        type="date"
        value={dueDate}
        onChange={(e) => setDueDate(e.target.value)}
        className="bg-slate-800 text-white px-3 py-3 rounded border border-white/20"
      />

      <button
        onClick={onAdd}
        className="w-full sm:w-auto bg-green-600 px-6 py-3 rounded"
      >
        Add
      </button>
    </div>
  );
}