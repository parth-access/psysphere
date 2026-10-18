"use client";

import React, { useState, useEffect } from "react";
import { CheckSquare, Square, Plus, Trash2, ListTodo, ClipboardList } from "lucide-react";

interface Task {
  id: string;
  text: string;
  completed: boolean;
  category?: string;
}

interface StudentTodaysFocusProps {
  nextClassTitle?: string;
  nextClassTopic?: string;
  firstAssignmentTitle?: string;
  lastCompletedClassTitle?: string;
}

export function StudentTodaysFocus({
  nextClassTitle,
  nextClassTopic,
  firstAssignmentTitle,
  lastCompletedClassTitle,
}: StudentTodaysFocusProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskText, setNewTaskText] = useState("");

  const getDefaultTasks = (): Task[] => {
    const list: Task[] = [];
    
    if (nextClassTitle) {
      list.push({
        id: "class-attend",
        text: `Attend Psychology Lecture: ${nextClassTitle}`,
        completed: false,
        category: "Lecture",
      });
    }

    if (nextClassTopic) {
      list.push({
        id: "class-prep",
        text: `Pre-read chapter notes on "${nextClassTopic}"`,
        completed: false,
        category: "Preparation",
      });
    }

    if (firstAssignmentTitle) {
      list.push({
        id: "assignment-submit",
        text: `Work on assignment: ${firstAssignmentTitle}`,
        completed: false,
        category: "Coursework",
      });
    }

    if (lastCompletedClassTitle) {
      list.push({
        id: "class-review",
        text: `Review last lecture slides for: ${lastCompletedClassTitle}`,
        completed: false,
        category: "Review",
      });
    }

    // Default general motivation tasks if empty
    if (list.length === 0) {
      list.push({
        id: "read-psy",
        text: "Read Psychology Chapter 4: Human Development",
        completed: false,
        category: "Self-Study",
      });
      list.push({
        id: "mindfulness",
        text: "Practice daily mindful breathing & take revision notes",
        completed: false,
        category: "Mindfulness",
      });
    }

    return list;
  };

  // Load from local storage on mount
  useEffect(() => {
    const list: Task[] = [];
    
    if (nextClassTitle) {
      list.push({
        id: "class-attend",
        text: `Attend Psychology Lecture: ${nextClassTitle}`,
        completed: false,
        category: "Lecture",
      });
    }

    if (nextClassTopic) {
      list.push({
        id: "class-prep",
        text: `Pre-read chapter notes on "${nextClassTopic}"`,
        completed: false,
        category: "Preparation",
      });
    }

    if (firstAssignmentTitle) {
      list.push({
        id: "assignment-submit",
        text: `Work on assignment: ${firstAssignmentTitle}`,
        completed: false,
        category: "Coursework",
      });
    }

    if (lastCompletedClassTitle) {
      list.push({
        id: "class-review",
        text: `Review last lecture slides for: ${lastCompletedClassTitle}`,
        completed: false,
        category: "Review",
      });
    }

    // Default general motivation tasks if empty
    if (list.length === 0) {
      list.push({
        id: "read-psy",
        text: "Read Psychology Chapter 4: Human Development",
        completed: false,
        category: "Self-Study",
      });
      list.push({
        id: "mindfulness",
        text: "Practice daily mindful breathing & take revision notes",
        completed: false,
        category: "Mindfulness",
      });
    }

    const saved = localStorage.getItem("saarthi_student_focus_tasks") || localStorage.getItem("psysphere_student_focus_tasks");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setTimeout(() => setTasks(parsed), 0);
      } catch (e) {
        setTimeout(() => setTasks(list), 0);
      }
    } else {
      setTimeout(() => setTasks(list), 0);
    }
  }, [nextClassTitle, nextClassTopic, firstAssignmentTitle, lastCompletedClassTitle]);

  // Save to local storage on change
  const saveTasks = (newTasks: Task[]) => {
    setTasks(newTasks);
    localStorage.setItem("saarthi_student_focus_tasks", JSON.stringify(newTasks));
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
      category: "Personal Focus",
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
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-brand-surface flex items-center justify-center text-brand-primary border border-brand-primary/10">
            <ClipboardList className="w-4.5 h-4.5 text-brand-primary" />
          </div>
          <div>
            <h3 className="text-sm font-sans font-bold text-ink-900">Today&apos;s Focus</h3>
            <p className="text-[11px] font-medium text-ink-500">
              {tasks.length > 0
                ? `${completedCount} of ${tasks.length} tasks completed`
                : "Your personal workspace is clear"}
            </p>
          </div>
        </div>

        {tasks.length === 0 && (
          <button
            onClick={handleResetDefaults}
            className="text-[10px] text-brand-primary hover:underline font-bold"
          >
            Reset Focus Tasks
          </button>
        )}
      </div>

      {/* Task list */}
      {tasks.length === 0 ? (
        <div className="text-center py-6 border border-dashed border-line rounded-2xl bg-paper/50">
          <p className="text-xs text-ink-500 font-medium">All tasks cleared for today!</p>
          <p className="text-[10px] text-ink-500 mt-0.5">Add a new homework, reading, or focus topic below.</p>
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
                className="pt-0.5 text-ink-500 hover:text-brand-primary transition-colors shrink-0 cursor-pointer"
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
                className="opacity-0 group-hover:opacity-100 p-1 text-ink-300 hover:text-rose-600 rounded-md hover:bg-rose-50 transition-all shrink-0 self-center cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add Task Input Form */}
      <form onSubmit={handleAddTask} className="flex gap-2">
        <input
          type="text"
          value={newTaskText}
          onChange={(e) => setNewTaskText(e.target.value)}
          placeholder="Add a custom homework or study goal..."
          className="flex-1 bg-paper border border-line focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/20 rounded-xl px-3 py-2 text-xs text-ink-900 placeholder-stone-400 focus:outline-none transition-all"
        />
        <button
          type="submit"
          className="p-2 bg-ink-900 hover:bg-ink-900 text-white rounded-xl transition-colors cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
