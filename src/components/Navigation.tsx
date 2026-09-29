'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { Timer, Hourglass, BarChart3, CheckSquare, Settings, Image, Volume2, Sparkles } from 'lucide-react';

export const Navigation: React.FC = () => {
  const { 
    activeTab, 
    setActiveTab, 
    setIsSettingsOpen, 
    setIsBgModalOpen,
    ambientState,
    toggleAmbient 
  } = useApp();

  const navItems = [
    { id: 'pomodoro', label: 'Pomodoro', icon: Timer, glow: 'hover:text-indigo-400' },
    { id: 'stopwatch', label: 'Stopwatch', icon: Hourglass, glow: 'hover:text-cyan-400' },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, glow: 'hover:text-emerald-400' },
    { id: 'todo', label: 'To-Do Tasks', icon: CheckSquare, glow: 'hover:text-purple-400' },
  ] as const;

  return (
    <header className="w-full max-w-5xl mx-auto px-4 pt-6 pb-2 z-30 relative">
      <div className="glass-panel rounded-2xl px-4 py-3 flex flex-wrap items-center justify-between gap-3 shadow-glass">
        {/* Brand / Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <Sparkles className="w-5 h-5 text-white animate-pulse" />
          </div>
          <div>
            <h1 className="text-lg font-bold bg-gradient-to-r from-white via-indigo-200 to-indigo-400 bg-clip-text text-transparent leading-tight tracking-wide">
              TimeTravel <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 ml-1 font-normal">Focus OS</span>
            </h1>
            <p className="text-[11px] text-slate-400 font-medium">Dark Glassmorphic Productivity</p>
          </div>
        </div>

        {/* Center Nav Pills */}
        <nav className="flex items-center gap-1.5 p-1 bg-black/30 rounded-xl border border-white/10 backdrop-blur-md">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-indigo-600/90 to-purple-600/90 text-white shadow-md shadow-indigo-500/25 border border-white/20'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span className="hidden sm:inline">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right Action Icons */}
        <div className="flex items-center gap-2">
          {/* Ambient Player Quick Toggle */}
          <button
            onClick={toggleAmbient}
            title={ambientState.isPlaying ? `Playing: ${ambientState.activeSound}` : 'Toggle Ambient Audio'}
            className={`p-2 rounded-xl transition-all border ${
              ambientState.isPlaying
                ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-400 shadow-neon-purple animate-pulse'
                : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:text-white'
            }`}
          >
            <Volume2 className="w-4 h-4" />
          </button>

          {/* Background Customizer Button */}
          <button
            onClick={() => setIsBgModalOpen(true)}
            title="Custom Wallpapers & Backgrounds"
            className="p-2 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 hover:text-cyan-400 transition-all"
          >
            <Image className="w-4 h-4" />
          </button>

          {/* Settings Button */}
          <button
            onClick={() => setIsSettingsOpen(true)}
            title="Timer & App Settings"
            className="p-2 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 hover:text-white transition-all"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
