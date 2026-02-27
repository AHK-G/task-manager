import { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { api } from "../api";
import type { Task } from "../types/task";

interface Props {
  task: Task;
  toggleTask: (task: Task) => void;
  deleteTask: (id: string) => void;
  disableDrag?: boolean;
}

export default function TaskItem({
  task,
  toggleTask,
  deleteTask,
  disableDrag = false,
}: Props) {
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

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editValue, setEditValue] = useState(task.title);
  const [saving, setSaving] = useState(false);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const due = task.dueDate ? new Date(task.dueDate) : null;
  const isOverdue = due && !task.completed && due < today;

  const saveTitle = async () => {
    if (!editValue.trim()) {
      setEditValue(task.title);
      setIsEditingTitle(false);
      return;
    }

    try {
      setSaving(true);
      await api.put(`/tasks/${task._id}`, {
        title: editValue,
      });
    } finally {
      setSaving(false);
      setIsEditingTitle(false);
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={disableDrag ? undefined : style}
      {...(disableDrag ? {} : attributes)}
      className={`group backdrop-blur-md border p-5 rounded-xl flex justify-between items-center transition-all duration-300 ${
        isOverdue
          ? "bg-red-900/30 border-red-500/40"
          : "bg-white/10 border-white/20 hover:bg-white/20"
      }`}
    >
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {!disableDrag && (
          <div
            {...listeners}
            className="cursor-grab text-slate-400 hover:text-white transition"
          >
            ☰
          </div>
        )}

        <input
          type="checkbox"
          checked={task.completed}
          onChange={() => toggleTask(task)}
          className="w-5 h-5 accent-indigo-500"
        />

        {isEditingTitle ? (
          <input
            autoFocus
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={saveTitle}
            onKeyDown={(e) => {
              if (e.key === "Enter") saveTitle();
              if (e.key === "Escape") {
                setEditValue(task.title);
                setIsEditingTitle(false);
              }
            }}
            className="flex-1 bg-white/20 border border-white/30 p-2 rounded-lg text-white outline-none"
          />
        ) : (
          <span
            onDoubleClick={() => setIsEditingTitle(true)}
            className={`text-lg truncate ${
              task.completed
                ? "line-through text-slate-400"
                : "text-white"
            }`}
          >
            {task.title}
          </span>
        )}
      </div>

      <div className="flex items-center gap-4 ml-6">
        <div className="flex items-center gap-4 opacity-0 group-hover:opacity-100 transition-all duration-300">
          {saving && (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          )}

          <button
            onClick={() => setIsEditingTitle(true)}
            className="text-indigo-400 hover:text-indigo-300 transition"
          >
            ✏
          </button>

          <button
            onClick={() => deleteTask(task._id)}
            className="text-red-400 hover:text-red-500 transition"
          >
            Delete
          </button>
        </div>

        <div className="flex items-center gap-3">
          {task.dueDate && (
            <span className="text-xs px-2 py-1 rounded-full bg-white/10 text-slate-300">
              {new Date(task.dueDate).toLocaleDateString()}
            </span>
          )}

          <span
            className={`text-xs px-2 py-1 rounded-full font-medium ${
              task.priority === "high"
                ? "bg-red-500/30 text-red-400"
                : task.priority === "medium"
                ? "bg-yellow-500/30 text-yellow-300"
                : "bg-blue-500/30 text-blue-300"
            }`}
          >
            {task.priority}
          </span>
        </div>
      </div>
    </div>
  );
}