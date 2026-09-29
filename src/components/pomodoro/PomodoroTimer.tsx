'use client';

import React, { useState, useEffect, useRef, useId } from 'react';
import { useApp } from '@/context/AppContext';
import { TimerMode } from '@/types';
import { soundEngine } from '@/utils/audio';
import confetti from 'canvas-confetti';
import { Play, Pause, RotateCcw, SkipForward, Flame, CheckCircle2, Tag, Volume2, Sparkles, Plus, Minus } from 'lucide-react';

export const PomodoroTimer: React.FC = () => {
  const { 
    timerSettings, 
    tasks, 
    activeTaskId, 
    setActiveTaskId, 
    toggleTask, 
    incrementTaskPomodoro, 
    logSession 
  } = useApp();

  const [mode, setMode] = useState<TimerMode>('pomodoro');
  const [timeLeft, setTimeLeft] = useState(timerSettings.pomodoroMinutes * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [cycleCount, setCycleCount] = useState(1);
  const [totalSecondsForMode, setTotalSecondsForMode] = useState(timerSettings.pomodoroMinutes * 60);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const activeTask = tasks.find(t => t.id === activeTaskId);
  const gradientId = useId();

  // Mode durations lookup
  const getDurationForMode = (m: TimerMode) => {
    switch (m) {
      case 'pomodoro': return timerSettings.pomodoroMinutes * 60;
      case 'shortBreak': return timerSettings.shortBreakMinutes * 60;
      case 'longBreak': return timerSettings.longBreakMinutes * 60;
    }
  };

  // Sync when settings change and timer is reset
  useEffect(() => {
    if (!isRunning) {
      const dur = getDurationForMode(mode);
      setTimeLeft(dur);
      setTotalSecondsForMode(dur);
    }
  }, [timerSettings, mode]);

  // Main countdown loop
  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (timerSettings.tickingSound && soundEngine && prev > 1) {
            soundEngine.playTick(15);
          }

          if (prev <= 1) {
            handleTimerComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, mode, cycleCount, timerSettings, activeTask]);

  // Document Title timer update
  useEffect(() => {
    const mins = Math.floor(timeLeft / 60);
    const secs = timeLeft % 60;
    const formatted = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    const modeLabel = mode === 'pomodoro' ? 'Focus' : mode === 'shortBreak' ? 'Short Break' : 'Long Break';
    document.title = `${formatted} - ${modeLabel} | TimeTravel`;
  }, [timeLeft, mode]);

  const handleTimerComplete = () => {
    setIsRunning(false);

    // Play Alarm
    if (soundEngine) {
      soundEngine.playAlarm(timerSettings.soundType, timerSettings.soundVolume);
    }

    // Native Browser Notification
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      new Notification(mode === 'pomodoro' ? 'Focus Session Completed!' : 'Break Over!', {
        body: mode === 'pomodoro' ? 'Great job! Time to take a restful break.' : 'Ready to resume focus?',
        icon: '/favicon.ico'
      });
    }

    if (mode === 'pomodoro') {
      // Confetti burst
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#818cf8', '#06b6d4', '#10b981', '#f43f5e']
        });
      } catch (e) {}

      // Log Session to analytics
      const durMinutes = Math.round(totalSecondsForMode / 60);
      logSession({
        timestamp: new Date().toISOString(),
        durationMinutes: durMinutes,
        mode: 'pomodoro',
        taskId: activeTask?.id,
        taskTitle: activeTask?.title || 'General Focus Session',
        category: activeTask?.category || 'Study',
      });

      // Increment task pomodoro if task selected
      if (activeTaskId) {
        incrementTaskPomodoro(activeTaskId);
      }

      // Check if long break interval reached
      const nextCycle = cycleCount + 1;
      setCycleCount(nextCycle);

      if (nextCycle % timerSettings.longBreakInterval === 0) {
        switchMode('longBreak', timerSettings.autoStartBreaks);
      } else {
        switchMode('shortBreak', timerSettings.autoStartBreaks);
      }
    } else {
      // Break finished, go back to pomodoro
      switchMode('pomodoro', timerSettings.autoStartPomodoros);
    }
  };

  const switchMode = (newMode: TimerMode, autoStart = false) => {
    setMode(newMode);
    const dur = getDurationForMode(newMode);
    setTimeLeft(dur);
    setTotalSecondsForMode(dur);
    setIsRunning(autoStart);
  };

  const toggleTimer = () => {
    if (!isRunning && timeLeft === 0) {
      const dur = getDurationForMode(mode);
      setTimeLeft(dur);
    }
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    const dur = getDurationForMode(mode);
    setTimeLeft(dur);
    setTotalSecondsForMode(dur);
  };

  const skipTimer = () => {
    if (confirm('Skip to the next session?')) {
      if (mode === 'pomodoro') {
        const nextCycle = cycleCount + 1;
        setCycleCount(nextCycle);
        if (nextCycle % timerSettings.longBreakInterval === 0) {
          switchMode('longBreak', false);
        } else {
          switchMode('shortBreak', false);
        }
      } else {
        switchMode('pomodoro', false);
      }
    }
  };

  const adjustTime = (seconds: number) => {
    setTimeLeft(prev => {
      const newVal = Math.max(10, prev + seconds);
      setTotalSecondsForMode(Math.max(newVal, totalSecondsForMode));
      return newVal;
    });
  };

  // Calculations for circular progress
  const progressPercent = totalSecondsForMode > 0 ? ((totalSecondsForMode - timeLeft) / totalSecondsForMode) * 100 : 0;
  const radius = 135;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  const getModeTheme = () => {
    switch (mode) {
      case 'pomodoro':
        return {
          gradient: 'from-indigo-500 via-purple-500 to-pink-500',
          ringColor1: '#6366f1',
          ringColor2: '#a855f7',
          glowShadow: 'rgba(99, 102, 241, 0.4)',
          badge: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
          title: 'Deep Focus'
        };
      case 'shortBreak':
        return {
          gradient: 'from-teal-400 via-cyan-500 to-blue-500',
          ringColor1: '#14b8a6',
          ringColor2: '#06b6d4',
          glowShadow: 'rgba(6, 182, 212, 0.4)',
          badge: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
          title: 'Short Recharge'
        };
      case 'longBreak':
        return {
          gradient: 'from-emerald-400 via-green-500 to-teal-500',
          ringColor1: '#10b981',
          ringColor2: '#059669',
          glowShadow: 'rgba(16, 185, 129, 0.4)',
          badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
          title: 'Deep Recovery'
        };
    }
  };

  const theme = getModeTheme();

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col items-center gap-6 py-4">
      {/* Top Mode Selector Tabs */}
      <div className="glass-panel p-1.5 rounded-2xl flex items-center gap-1 shadow-glass border border-white/10">
        <button
          onClick={() => switchMode('pomodoro')}
          className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${
            mode === 'pomodoro'
              ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/30'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          Pomodoro ({timerSettings.pomodoroMinutes}m)
        </button>
        <button
          onClick={() => switchMode('shortBreak')}
          className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${
            mode === 'shortBreak'
              ? 'bg-gradient-to-r from-teal-500 to-cyan-600 text-white shadow-lg shadow-cyan-500/30'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          Short Break ({timerSettings.shortBreakMinutes}m)
        </button>
        <button
          onClick={() => switchMode('longBreak')}
          className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${
            mode === 'longBreak'
              ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/30'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          Long Break ({timerSettings.longBreakMinutes}m)
        </button>
      </div>

      {/* Main Circular Timer Display Card */}
      <div className="relative w-full max-w-md aspect-square flex items-center justify-center">
        {/* Glow backdrop */}
        <div 
          className="absolute inset-4 rounded-full blur-3xl opacity-30 transition-all duration-700 pointer-events-none"
          style={{ background: theme.glowShadow }}
        />

        {/* Circular SVG Ring */}
        <svg className="w-full h-full -rotate-90 transform drop-shadow-2xl">
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={theme.ringColor1} />
              <stop offset="100%" stopColor={theme.ringColor2} />
            </linearGradient>
          </defs>
          {/* Background Track */}
          <circle
            cx="50%"
            cy="50%"
            r={radius}
            className="stroke-white/10"
            strokeWidth="12"
            fill="transparent"
          />
          {/* Progress Ring */}
          <circle
            cx="50%"
            cy="50%"
            r={radius}
            stroke={`url(#${gradientId})`}
            strokeWidth="12"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-1000 ease-linear"
          />
        </svg>

        {/* Inner Content Card */}
        <div className="absolute inset-8 rounded-full glass-card flex flex-col items-center justify-center p-6 border border-white/15 text-center shadow-inner">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${theme.badge}`}>
              {theme.title}
            </span>
            <span className="text-[11px] font-medium text-slate-400 bg-white/5 px-2 py-0.5 rounded-full border border-white/10 flex items-center gap-1">
              <Flame className="w-3 h-3 text-amber-400" /> #{cycleCount}
            </span>
          </div>

          {/* Large Digit Timer */}
          <div className="text-6xl sm:text-7xl font-black tracking-tight text-white font-mono my-2 select-none drop-shadow-md">
            {minutes.toString().padStart(2, '0')}
            <span className={`inline-block mx-1 ${isRunning ? 'animate-pulse text-indigo-400' : 'text-slate-500'}`}>:</span>
            {seconds.toString().padStart(2, '0')}
          </div>

          {/* Quick Adjust Buttons */}
          <div className="flex items-center gap-2 mt-1 mb-2">
            <button
              onClick={() => adjustTime(-60)}
              title="Minus 1 Minute"
              className="p-1 rounded-md bg-white/5 hover:bg-white/15 text-slate-400 hover:text-white transition text-xs border border-white/10"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="text-[11px] text-slate-400 font-mono">
              {Math.round(progressPercent)}% done
            </span>
            <button
              onClick={() => adjustTime(60)}
              title="Plus 1 Minute"
              className="p-1 rounded-md bg-white/5 hover:bg-white/15 text-slate-400 hover:text-white transition text-xs border border-white/10"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Active Task Link */}
          {activeTask ? (
            <div className="flex items-center gap-2 max-w-[240px] px-3 py-1 rounded-full bg-white/10 border border-white/15 text-xs text-slate-200">
              <Tag className="w-3 h-3 text-indigo-400 shrink-0" />
              <span className="truncate">{activeTask.title}</span>
            </div>
          ) : (
            <span className="text-xs text-slate-400 italic">No task assigned</span>
          )}
        </div>
      </div>

      {/* Primary Action Buttons */}
      <div className="flex items-center gap-4 z-10">
        <button
          onClick={resetTimer}
          title="Reset Session"
          className="p-3.5 rounded-2xl glass-button text-slate-300 hover:text-rose-400 transition shadow-glass"
        >
          <RotateCcw className="w-5 h-5" />
        </button>

        <button
          onClick={toggleTimer}
          className={`flex items-center gap-3 px-9 py-4 rounded-2xl font-bold text-base transition-all transform active:scale-95 shadow-xl ${
            isRunning
              ? 'bg-gradient-to-r from-amber-500 to-rose-500 text-white shadow-rose-500/30 border border-white/25'
              : 'glass-button-primary text-white shadow-indigo-500/40'
          }`}
        >
          {isRunning ? (
            <>
              <Pause className="w-6 h-6 fill-current" />
              <span>PAUSE</span>
            </>
          ) : (
            <>
              <Play className="w-6 h-6 fill-current ml-0.5" />
              <span>START FOCUS</span>
            </>
          )}
        </button>

        <button
          onClick={skipTimer}
          title="Skip to Next"
          className="p-3.5 rounded-2xl glass-button text-slate-300 hover:text-cyan-400 transition shadow-glass"
        >
          <SkipForward className="w-5 h-5" />
        </button>
      </div>

      {/* Linked Task Detail Pill / Select prompt */}
      {activeTask && (
        <div className="glass-panel w-full p-4 rounded-2xl flex items-center justify-between border border-white/10 shadow-glass">
          <div className="flex items-center gap-3">
            <button
              onClick={() => toggleTask(activeTask.id)}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-emerald-500/20 text-slate-400 hover:text-emerald-400 transition"
            >
              <CheckCircle2 className="w-5 h-5" />
            </button>
            <div>
              <p className="text-sm font-semibold text-white">{activeTask.title}</p>
              <p className="text-xs text-slate-400">
                Category: <span className="text-indigo-300">{activeTask.category}</span> • Completed: {activeTask.actPomodoros}/{activeTask.estPomodoros} pomodoros
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveTaskId(null)}
            className="text-xs text-slate-400 hover:text-slate-200 underline"
          >
            Detach
          </button>
        </div>
      )}
    </div>
  );
};
