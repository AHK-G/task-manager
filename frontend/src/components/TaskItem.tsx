import { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { api } from "../api";
import type { Task } from "../types/task";

interface Props {
  task: Task;
  toggleTask: (task: Task) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
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
  const [savingTitle, setSavingTitle] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [toggling, setToggling] = useState(false);

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
      setSavingTitle(true);
      await api.put(`/tasks/${task._id}`, {
        title: editValue,
      });
    } finally {
      setSavingTitle(false);
      setIsEditingTitle(false);
    }
  };

  const handleDelete = async () => {
    try {
      setDeleting(true);
      await deleteTask(task._id);
    } finally {
      setDeleting(false);
    }
  };

  const handleToggle = async () => {
    try {
      setToggling(true);
      await toggleTask(task);
    } finally {
      setToggling(false);
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={disableDrag ? undefined : style}
      {...(disableDrag ? {} : attributes)}
      className={`group backdrop-blur-md border p-4 sm:p-5 rounded-xl transition-all duration-300
        flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4
        ${
          isOverdue
            ? "bg-red-900/30 border-red-500/40"
            : "bg-white/10 border-white/20 hover:bg-white/20"
        }
      `}
    >
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {!disableDrag && (
          <div
            {...listeners}
            className="cursor-grab text-slate-400 hover:text-white transition text-lg"
          >
            ☰
          </div>
        )}

        <input
          type="checkbox"
          checked={task.completed}
          onChange={handleToggle}
          disabled={toggling}
          className="w-5 h-5 accent-indigo-500 shrink-0 disabled:opacity-50"
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
            className={`text-base sm:text-lg truncate ${
              task.completed
                ? "line-through text-slate-400"
                : "text-white"
            }`}
          >
            {task.title}
          </span>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3 sm:gap-4 sm:ml-6">

        <div className="flex items-center gap-3 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-300">

          {savingTitle && (
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
          )}

          <button
            onClick={() => setIsEditingTitle(true)}
            disabled={savingTitle}
            className="text-indigo-400 hover:text-indigo-300 transition disabled:opacity-50"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-5 h-5"
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

          <button
            onClick={handleDelete}
            disabled={deleting}
            className="flex items-center gap-1 text-red-400 hover:text-red-500 transition disabled:opacity-50"
          >
            {deleting && (
              <span className="w-3 h-3 border-2 border-red-400 border-t-transparent rounded-full animate-spin"></span>
            )}
            Delete
          </button>
        </div>

        {task.dueDate && (
          <span className="text-xs px-2 py-1 rounded-full bg-white/10 text-slate-300">
            {new Date(task.dueDate).toLocaleDateString()}
          </span>
        )}

        {task.priority && (
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
        )}
      </div>
    </div>
  );
}