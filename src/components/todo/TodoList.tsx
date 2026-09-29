'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Task } from '@/types';
import { 
  Plus, CheckCircle2, Circle, Trash2, Tag, Play, 
  Flame, ListFilter, Check, Clock, AlertCircle 
} from 'lucide-react';

export const TodoList: React.FC = () => {
  const { 
    tasks, 
    addTask, 
    toggleTask, 
    deleteTask, 
    activeTaskId, 
    setActiveTaskId, 
    setActiveTab 
  } = useApp();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<Task['category']>('Study');
  const [priority, setPriority] = useState<Task['priority']>('medium');
  const [estPomodoros, setEstPomodoros] = useState(2);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [isAddingOpen, setIsAddingOpen] = useState(false);

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    addTask({
      title: title.trim(),
      category,
      priority,
      estPomodoros,
      completed: false,
    });

    setTitle('');
    setIsAddingOpen(false);
  };

  const handleStartTaskFocus = (taskId: string) => {
    setActiveTaskId(taskId);
    setActiveTab('pomodoro');
  };

  const filteredTasks = tasks.filter(task => {
    if (filter === 'active' && task.completed) return false;
    if (filter === 'completed' && !task.completed) return false;
    if (categoryFilter !== 'all' && task.category !== categoryFilter) return false;
    return true;
  });

  const getPriorityBadge = (p: Task['priority']) => {
    switch (p) {
      case 'high':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/30';
      case 'medium':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      case 'low':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
    }
  };

  const totalEstPomodoros = tasks.reduce((sum, t) => sum + (t.completed ? 0 : t.estPomodoros), 0);
  const completedPomodoros = tasks.reduce((sum, t) => sum + t.actPomodoros, 0);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 py-4">
      {/* Top Header Card */}
      <div className="glass-panel p-6 rounded-3xl border border-white/10 shadow-glass flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            Focus Task Management
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              {tasks.filter(t => !t.completed).length} pending
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Est. Time Remaining: ~{totalEstPomodoros * 25} mins ({totalEstPomodoros} pomodoros) • Completed: {completedPomodoros} sessions
          </p>
        </div>

        <button
          onClick={() => setIsAddingOpen(!isAddingOpen)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-xs font-bold text-white shadow-lg shadow-indigo-500/25 hover:opacity-95 transition"
        >
          <Plus className="w-4 h-4" />
          <span>New Task</span>
        </button>
      </div>

      {/* Add Task Expandable Form */}
      {isAddingOpen && (
        <form onSubmit={handleCreateTask} className="glass-panel p-6 rounded-3xl border border-indigo-500/30 shadow-glass animate-in fade-in slide-in-from-top-4 duration-200">
          <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
            <Plus className="w-4 h-4 text-indigo-400" /> Create Focus Task
          </h3>

          <div className="space-y-4">
            <input
              type="text"
              placeholder="What are you focusing on?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
              className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/15 text-white placeholder-slate-400 text-sm focus:outline-none focus:border-indigo-400"
            />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Category */}
              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/15 text-xs text-slate-200 focus:outline-none focus:border-indigo-400"
                >
                  <option value="Study">Study</option>
                  <option value="Coding">Coding</option>
                  <option value="Work">Work</option>
                  <option value="Reading">Reading</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Priority */}
              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">Priority</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/15 text-xs text-slate-200 focus:outline-none focus:border-indigo-400"
                >
                  <option value="high">High Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="low">Low Priority</option>
                </select>
              </div>

              {/* Estimated Pomodoros */}
              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">Est. Pomodoros ({estPomodoros * 25}m)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={estPomodoros}
                    onChange={(e) => setEstPomodoros(Number(e.target.value))}
                    className="w-full"
                  />
                  <span className="text-xs font-mono font-bold text-indigo-300 w-6 text-center">{estPomodoros}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsAddingOpen(false)}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs text-slate-300 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-xs font-bold text-white shadow-md hover:opacity-90 transition"
              >
                Add Task
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-1">
        <div className="flex items-center gap-1 p-1 bg-black/30 rounded-xl border border-white/10">
          {(['all', 'active', 'completed'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold capitalize transition ${
                filter === tab
                  ? 'bg-white/15 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <ListFilter className="w-4 h-4 text-slate-400" />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-black/30 border border-white/10 text-xs text-slate-300 rounded-xl px-3 py-1.5 focus:outline-none"
          >
            <option value="all">All Categories</option>
            <option value="Study">Study</option>
            <option value="Coding">Coding</option>
            <option value="Work">Work</option>
            <option value="Reading">Reading</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>

      {/* Task List Items */}
      <div className="space-y-3">
        {filteredTasks.map(task => {
          const isActive = activeTaskId === task.id;

          return (
            <div
              key={task.id}
              className={`glass-card p-4 rounded-2xl border transition-all flex flex-wrap sm:flex-nowrap items-center justify-between gap-4 ${
                isActive
                  ? 'border-indigo-500/60 bg-indigo-950/30 shadow-neon-purple'
                  : task.completed
                  ? 'opacity-60 border-white/5'
                  : 'border-white/10'
              }`}
            >
              {/* Checkbox and Title */}
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <button
                  onClick={() => toggleTask(task.id)}
                  className="shrink-0 text-slate-400 hover:text-emerald-400 transition"
                >
                  {task.completed ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 fill-emerald-500/20" />
                  ) : (
                    <Circle className="w-5 h-5 text-slate-400" />
                  )}
                </button>

                <div className="min-w-0 flex-1">
                  <p className={`text-sm font-semibold truncate ${task.completed ? 'line-through text-slate-400' : 'text-white'}`}>
                    {task.title}
                  </p>
                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-slate-300 border border-white/10">
                      {task.category}
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border ${getPriorityBadge(task.priority)}`}>
                      {task.priority}
                    </span>
                    {isActive && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/30 text-indigo-300 border border-indigo-400/40 font-bold flex items-center gap-1">
                        <Flame className="w-3 h-3 text-amber-400" /> Active Session
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Pomodoro Progress & Actions */}
              <div className="flex items-center gap-4 shrink-0 w-full sm:w-auto justify-between sm:justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-white/5">
                {/* Pomodoro Counter dots */}
                <div className="flex items-center gap-1 bg-black/30 px-2.5 py-1 rounded-full border border-white/10" title="Completed / Estimated Pomodoros">
                  <span className="text-xs font-mono font-bold text-white">{task.actPomodoros}</span>
                  <span className="text-xs text-slate-400">/</span>
                  <span className="text-xs font-mono text-slate-400">{task.estPomodoros} 🍅</span>
                </div>

                {/* Focus in Pomodoro button */}
                {!task.completed && (
                  <button
                    onClick={() => handleStartTaskFocus(task.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                      isActive
                        ? 'bg-indigo-600 text-white shadow-md'
                        : 'bg-white/10 hover:bg-white/20 text-slate-200'
                    }`}
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>{isActive ? 'In Focus' : 'Focus'}</span>
                  </button>
                )}

                {/* Delete button */}
                <button
                  onClick={() => deleteTask(task.id)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition"
                  title="Delete Task"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}

        {filteredTasks.length === 0 && (
          <div className="glass-panel p-12 rounded-3xl text-center border border-white/10">
            <Check className="w-10 h-10 text-emerald-400/50 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-300">All caught up!</p>
            <p className="text-xs text-slate-500 mt-1">No tasks in this view. Click "New Task" to create one.</p>
          </div>
        )}
      </div>
    </div>
  );
};
