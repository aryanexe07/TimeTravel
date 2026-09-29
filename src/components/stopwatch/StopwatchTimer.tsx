'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '@/context/AppContext';
import { LapRecord } from '@/types';
import { Play, Pause, RotateCcw, Flag, Save, CheckCircle, TrendingUp, Sparkles, Clock } from 'lucide-react';

export const StopwatchTimer: React.FC = () => {
  const { logSession, tasks } = useApp();
  const [time, setTime] = useState(0); // in ms
  const [isRunning, setIsRunning] = useState(false);
  const [laps, setLaps] = useState<LapRecord[]>([]);
  const [showMs, setShowMs] = useState(true);
  const [selectedTask, setSelectedTask] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Study');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const startTimeRef = useRef<number>(0);
  const accumulatedTimeRef = useRef<number>(0);
  const animFrameRef = useRef<number | null>(null);

  useEffect(() => {
    if (isRunning) {
      startTimeRef.current = performance.now();
      const update = () => {
        const now = performance.now();
        const delta = now - startTimeRef.current;
        setTime(accumulatedTimeRef.current + delta);
        animFrameRef.current = requestAnimationFrame(update);
      };
      animFrameRef.current = requestAnimationFrame(update);
    } else {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      accumulatedTimeRef.current = time;
    }

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isRunning]);

  const handleStartPause = () => {
    setIsRunning(!isRunning);
    setSavedSuccess(false);
  };

  const handleReset = () => {
    setIsRunning(false);
    setTime(0);
    accumulatedTimeRef.current = 0;
    setLaps([]);
    setSavedSuccess(false);
  };

  const handleLap = () => {
    if (!isRunning && time === 0) return;
    const lastLapTotal = laps.length > 0 ? laps[0].overallTime : 0;
    const currentLapTime = time - lastLapTotal;

    const newLap: LapRecord = {
      lapNumber: laps.length + 1,
      lapTime: currentLapTime,
      overallTime: time,
    };
    setLaps(prev => [newLap, ...prev]);
  };

  const handleSaveToAnalytics = () => {
    if (time < 30000) { // minimum 30 seconds
      alert('Please run the stopwatch for at least 30 seconds to log as a study session.');
      return;
    }
    const minutes = Math.max(1, Math.round(time / 60000));
    const matchedTask = tasks.find(t => t.id === selectedTask);
    
    logSession({
      timestamp: new Date().toISOString(),
      durationMinutes: minutes,
      mode: 'stopwatch',
      taskId: selectedTask || undefined,
      taskTitle: matchedTask?.title || `${selectedCategory} Stopwatch Session`,
      category: matchedTask?.category || selectedCategory,
    });

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  // Find min and max lap times for highlighting
  const lapTimes = laps.map(l => l.lapTime);
  const minLapTime = lapTimes.length > 1 ? Math.min(...lapTimes) : -1;
  const maxLapTime = lapTimes.length > 1 ? Math.max(...lapTimes) : -1;

  // Format Helper
  const formatTime = (ms: number, includeMs = true) => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    const hundredths = Math.floor((ms % 1000) / 10);

    const pad = (n: number) => n.toString().padStart(2, '0');

    if (hours > 0) {
      return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}${includeMs ? `.${pad(hundredths)}` : ''}`;
    }
    return `${pad(minutes)}:${pad(seconds)}${includeMs ? `.${pad(hundredths)}` : ''}`;
  };

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col items-center gap-6 py-4">
      {/* Stopwatch Main Glass Card */}
      <div className="w-full glass-panel rounded-3xl p-8 border border-white/15 relative overflow-hidden flex flex-col items-center shadow-glass">
        {/* Ambient Glow */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-80 h-40 bg-cyan-500/20 blur-3xl rounded-full pointer-events-none" />

        {/* Top Header & Settings */}
        <div className="w-full flex items-center justify-between mb-4 z-10">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-cyan-500/20 border border-cyan-500/30 text-cyan-400">
              <Clock className="w-4 h-4" />
            </span>
            <span className="text-xs font-semibold text-cyan-300 uppercase tracking-wider">Precision Stopwatch</span>
          </div>
          <button
            onClick={() => setShowMs(!showMs)}
            className="text-xs px-3 py-1 rounded-full bg-white/5 border border-white/10 text-slate-300 hover:text-white transition"
          >
            {showMs ? 'Hide ms' : 'Show ms'}
          </button>
        </div>

        {/* Digital Counter */}
        <div className="text-5xl sm:text-7xl font-black font-mono tracking-tight text-white my-6 select-none drop-shadow-lg z-10">
          {formatTime(time, showMs)}
        </div>

        {/* Sub-counter: Current Lap Duration */}
        {laps.length > 0 && (
          <div className="text-xs font-mono text-cyan-300 bg-cyan-950/40 px-3 py-1.5 rounded-full border border-cyan-500/20 mb-4 z-10">
            Current Split: +{formatTime(time - laps[0].overallTime, showMs)}
          </div>
        )}

        {/* Control Buttons */}
        <div className="flex items-center gap-4 z-10 mt-2">
          {/* Reset */}
          <button
            onClick={handleReset}
            disabled={time === 0}
            title="Reset"
            className="p-3.5 rounded-2xl glass-button text-slate-300 hover:text-rose-400 disabled:opacity-30 disabled:cursor-not-allowed transition"
          >
            <RotateCcw className="w-5 h-5" />
          </button>

          {/* Start / Pause */}
          <button
            onClick={handleStartPause}
            className={`flex items-center gap-3 px-10 py-4 rounded-2xl font-bold text-base transition-all transform active:scale-95 shadow-xl ${
              isRunning
                ? 'bg-gradient-to-r from-amber-500 to-rose-500 text-white shadow-rose-500/30 border border-white/20'
                : 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-cyan-500/40 border border-white/20'
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
                <span>START</span>
              </>
            )}
          </button>

          {/* Lap / Split */}
          <button
            onClick={handleLap}
            disabled={!isRunning && time === 0}
            title="Lap Split"
            className="p-3.5 rounded-2xl glass-button text-slate-300 hover:text-cyan-300 disabled:opacity-30 disabled:cursor-not-allowed transition"
          >
            <Flag className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Save to Study Analytics Section */}
      {time > 5000 && (
        <div className="w-full glass-panel rounded-2xl p-4 border border-white/10 flex flex-wrap items-center justify-between gap-3 shadow-glass">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
            <div>
              <p className="text-sm font-semibold text-white">Log as Study Session</p>
              <p className="text-xs text-slate-400">Save your {Math.round(time / 60000)} min timer to daily analytics</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-black/40 border border-white/15 text-xs text-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-cyan-400"
            >
              <option value="Study">Study</option>
              <option value="Coding">Coding</option>
              <option value="Work">Work</option>
              <option value="Reading">Reading</option>
              <option value="Other">Other</option>
            </select>

            <button
              onClick={handleSaveToAnalytics}
              disabled={savedSuccess}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 text-xs font-bold text-white hover:opacity-90 transition shadow-md"
            >
              {savedSuccess ? (
                <>
                  <CheckCircle className="w-4 h-4 text-white" />
                  <span>Logged!</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Log Study</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Laps List Table */}
      {laps.length > 0 && (
        <div className="w-full glass-panel rounded-2xl p-5 border border-white/10 shadow-glass">
          <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Laps Record ({laps.length})</span>
            <span className="text-xs text-slate-400 font-mono">Split / Overall</span>
          </div>

          <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
            {laps.map((lap) => {
              const isFastest = minLapTime !== -1 && lap.lapTime === minLapTime;
              const isSlowest = maxLapTime !== -1 && lap.lapTime === maxLapTime;

              return (
                <div
                  key={lap.lapNumber}
                  className={`flex items-center justify-between p-2.5 rounded-xl border text-xs font-mono transition ${
                    isFastest
                      ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                      : isSlowest
                      ? 'bg-rose-500/15 border-rose-500/30 text-rose-300'
                      : 'bg-white/5 border-white/5 text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-400">#{lap.lapNumber}</span>
                    {isFastest && <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-sans font-semibold">Fastest</span>}
                    {isSlowest && <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-400 font-sans font-semibold">Slowest</span>}
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="font-bold">+{formatTime(lap.lapTime, showMs)}</span>
                    <span className="text-slate-400">{formatTime(lap.overallTime, showMs)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
