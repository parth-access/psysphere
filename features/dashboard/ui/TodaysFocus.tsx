"use client";

import React, { useState, useEffect } from "react";
import { CheckSquare, Square, Plus, Trash2, ListTodo, Sparkles } from "lucide-react";

interface Task {
  id: string;
  text: string;
  completed: boolean;
  category?: string;
}

export function TodaysFocus() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskText, setNewTaskText] = useState("");

  const getDefaultTasks = (): Task[] => [
    { id: "1", text: "Check Assignment 2 & grade active submissions", completed: false, category: "Grading" },
    { id: "2", text: "Upload the upcoming Memory worksheet to Class 11 portal", completed: false, category: "Resources" },
    { id: "3", text: "Review last lecture's notes and prepare introductory slides", completed: false, category: "Preparation" },
  ];

  // Load from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem("saarthi_teacher_focus") || localStorage.getItem("psysphere_teacher_focus");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setTimeout(() => setTasks(parsed), 0);
      } catch (e) {
        // Fallback to default tasks
        setTimeout(() => setTasks(getDefaultTasks()), 0);
      }
    } else {
      setTimeout(() => setTasks(getDefaultTasks()), 0);
    }
  }, []);

  // Save to local storage on change
  const saveTasks = (newTasks: Task[]) => {
    setTasks(newTasks);
    localStorage.setItem("saarthi_teacher_focus", JSON.stringify(newTasks));
  };

  const handleToggle = (id: string) => {
    const updated = tasks.map((task) =>
      task.id === id ? { ...task, completed: !task.completed } : task
    );
    saveTasks(updated);
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskText.trim()) return;

    const newTask: Task = {
      id: Date.now().toString(),
      text: newTaskText.trim(),
      completed: false,
      category: "Focus Task",
    };

    saveTasks([...tasks, newTask]);
    setNewTaskText("");
  };

  const handleDeleteTask = (id: string) => {
    const updated = tasks.filter((task) => task.id !== id);
    saveTasks(updated);
  };

  const handleResetDefaults = () => {
    saveTasks(getDefaultTasks());
  };

  const completedCount = tasks.filter((t) => t.completed).length;

  return (
    <div className="bg-white border border-line/80 rounded-2xl p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-marigold-100 flex items-center justify-center text-gold-700 border border-marigold-100">
            <ListTodo className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-ink-900">Today&apos;s Focus</h3>
            <p className="text-[11px] text-ink-500">
              {tasks.length > 0 
                ? `${completedCount} of ${tasks.length} tasks completed`
                : "Your notepad is clear"}
            </p>
          </div>
        </div>

        {tasks.length === 0 && (
          <button 
            onClick={handleResetDefaults}
            className="text-[10px] text-brand-primary hover:underline font-semibold"
          >
            Reset Defaults
          </button>
        )}
      </div>

      {/* Task list */}
      {tasks.length === 0 ? (
        <div className="text-center py-6 border border-dashed border-line rounded-2xl bg-paper/50">
          <p className="text-xs text-ink-500 font-medium">No tasks on your plate for today!</p>
          <p className="text-[10px] text-ink-500 mt-0.5">Add a quick note or task below to stay focused.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {tasks.map((task) => (
            <div 
              key={task.id} 
              className={`flex items-start justify-between gap-3 p-3 rounded-xl border transition-all group ${
                task.completed 
                  ? "bg-paper/70 border-line/50 text-ink-500 opacity-80" 
                  : "bg-white border-line/60 text-ink-700 hover:border-line"
              }`}
            >
              <button 
                onClick={() => handleToggle(task.id)}
                className="pt-0.5 text-ink-500 hover:text-brand-primary transition-colors shrink-0"
              >
                {task.completed ? (
                  <CheckSquare className="w-4 h-4 text-sage-600" />
                ) : (
                  <Square className="w-4 h-4 text-ink-300 group-hover:text-ink-500" />
                )}
              </button>

              <div className="flex-1 min-w-0">
                <span className={`text-xs block leading-relaxed break-words font-medium ${task.completed ? "line-through text-ink-500" : "text-ink-900"}`}>
                  {task.text}
                </span>
                {task.category && !task.completed && (
                  <span className="inline-block text-[9px] font-bold text-ink-500 uppercase tracking-wider mt-0.5">
                    {task.category}
                  </span>
                )}
              </div>

              <button 
                onClick={() => handleDeleteTask(task.id)}
                className="opacity-0 group-hover:opacity-100 p-1 text-ink-300 hover:text-rose-600 rounded-md hover:bg-rose-50 transition-all shrink-0 self-center"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add Task input form */}
      <form onSubmit={handleAddTask} className="flex gap-2">
        <input 
          type="text" 
          value={newTaskText}
          onChange={(e) => setNewTaskText(e.target.value)}
          placeholder="Add a custom task for today..."
          className="flex-1 bg-paper border border-line focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/20 rounded-xl px-3 py-2 text-xs text-ink-900 placeholder-stone-400 focus:outline-none transition-all"
        />
        <button 
          type="submit"
          className="p-2 bg-forest-800 hover:bg-forest-900 text-paper rounded-full transition-colors cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
