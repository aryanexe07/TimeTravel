'use client';

import React, { useState, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { 
  BarChart, Bar, AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, CartesianGrid 
} from 'recharts';
import { 
  BarChart3, Calendar, Clock, Award, Flame, Zap, Trash2, 
  Download, ArrowUpRight, TrendingUp, PieChart as PieIcon 
} from 'lucide-react';

const CATEGORY_COLORS: Record<string, string> = {
  Study: '#6366f1',   // Indigo
  Coding: '#06b6d4',  // Cyan
  Work: '#a855f7',    // Purple
  Reading: '#10b981', // Emerald
  Other: '#f59e0b',   // Amber
};

export const AnalyticsDashboard: React.FC = () => {
  const { sessions, clearHistory } = useApp();
  const [viewRange, setViewRange] = useState<'daily' | 'weekly' | 'monthly'>('daily');

  // Compute key stats
  const stats = useMemo(() => {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    let totalMinutes = 0;
    let todayMinutes = 0;
    const categoryTotals: Record<string, number> = {};
    const dateMap = new Set<string>();

    sessions.forEach(s => {
      totalMinutes += s.durationMinutes;
      const dateStr = s.timestamp.split('T')[0];
      dateMap.add(dateStr);

      if (dateStr === todayStr) {
        todayMinutes += s.durationMinutes;
      }

      const cat = s.category || 'Study';
      categoryTotals[cat] = (categoryTotals[cat] || 0) + s.durationMinutes;
    });

    // Calculate streak
    let streak = 0;
    const checkDate = new Date();
    while (true) {
      const dStr = checkDate.toISOString().split('T')[0];
      if (dateMap.has(dStr)) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        // Allow streak if today hasn't been logged yet but yesterday was
        if (streak === 0) {
          checkDate.setDate(checkDate.getDate() - 1);
          const yesterdayStr = checkDate.toISOString().split('T')[0];
          if (dateMap.has(yesterdayStr)) {
            streak++;
            checkDate.setDate(checkDate.getDate() - 1);
            continue;
          }
        }
        break;
      }
    }

    return {
      totalHours: (totalMinutes / 60).toFixed(1),
      todayHours: (todayMinutes / 60).toFixed(1),
      todayMinutes,
      totalSessions: sessions.length,
      streak,
      categoryTotals,
    };
  }, [sessions]);

  // Chart Data Generator: Daily (Last 7 days)
  const dailyData = useMemo(() => {
    const days: { label: string; hours: number; minutes: number }[] = [];
    const now = new Date();

    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const dStr = d.toISOString().split('T')[0];
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });

      const dayMins = sessions
        .filter(s => s.timestamp.startsWith(dStr))
        .reduce((acc, s) => acc + s.durationMinutes, 0);

      days.push({
        label: i === 0 ? 'Today' : dayName,
        hours: Number((dayMins / 60).toFixed(2)),
        minutes: dayMins,
      });
    }
    return days;
  }, [sessions]);

  // Chart Data Generator: Weekly (Last 4 weeks)
  const weeklyData = useMemo(() => {
    const weeks: { label: string; hours: number; minutes: number }[] = [];
    const now = new Date();

    for (let i = 3; i >= 0; i--) {
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - (i * 7 + 6));
      const endOfWeek = new Date(now);
      endOfWeek.setDate(now.getDate() - (i * 7));

      const mins = sessions
        .filter(s => {
          const t = new Date(s.timestamp).getTime();
          return t >= startOfWeek.getTime() && t <= endOfWeek.getTime() + 86400000;
        })
        .reduce((acc, s) => acc + s.durationMinutes, 0);

      weeks.push({
        label: i === 0 ? 'This Wk' : `Wk -${i}`,
        hours: Number((mins / 60).toFixed(2)),
        minutes: mins,
      });
    }
    return weeks;
  }, [sessions]);

  // Chart Data Generator: Monthly (Last 6 months)
  const monthlyData = useMemo(() => {
    const months: { label: string; hours: number; minutes: number }[] = [];
    const now = new Date();

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const yearMonth = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}`;
      const monthLabel = d.toLocaleDateString('en-US', { month: 'short' });

      const mins = sessions
        .filter(s => s.timestamp.startsWith(yearMonth))
        .reduce((acc, s) => acc + s.durationMinutes, 0);

      months.push({
        label: monthLabel,
        hours: Number((mins / 60).toFixed(2)),
        minutes: mins,
      });
    }
    return months;
  }, [sessions]);

  // Category Pie Data
  const categoryData = useMemo(() => {
    return Object.entries(stats.categoryTotals).map(([name, mins]) => ({
      name,
      value: mins,
      hours: (mins / 60).toFixed(1),
      color: CATEGORY_COLORS[name] || '#6366f1',
    }));
  }, [stats.categoryTotals]);

  // Active chart dataset
  const activeChartData = viewRange === 'daily' ? dailyData : viewRange === 'weekly' ? weeklyData : monthlyData;

  const handleExportCSV = () => {
    if (sessions.length === 0) return alert('No sessions to export');
    const headers = ['Session ID,Date,Duration (Minutes),Mode,Category,Task Title\n'];
    const rows = sessions.map(s => `"${s.id}","${s.timestamp}",${s.durationMinutes},"${s.mode}","${s.category}","${s.taskTitle || ''}"`);
    const blob = new Blob([...headers, rows.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `timetravel-study-analytics-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 py-4">
      {/* Top Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Time */}
        <div className="glass-panel p-5 rounded-2xl border border-white/10 relative overflow-hidden shadow-glass">
          <div className="absolute top-0 right-0 p-3 opacity-15">
            <Clock className="w-12 h-12 text-indigo-400" />
          </div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Focus Time</p>
          <div className="text-3xl font-black text-white mt-2 font-mono">
            {stats.totalHours} <span className="text-sm font-normal text-indigo-300">hrs</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" /> Lifetime logged
          </p>
        </div>

        {/* Today's Focus */}
        <div className="glass-panel p-5 rounded-2xl border border-white/10 relative overflow-hidden shadow-glass">
          <div className="absolute top-0 right-0 p-3 opacity-15">
            <Zap className="w-12 h-12 text-cyan-400" />
          </div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Today's Focus</p>
          <div className="text-3xl font-black text-white mt-2 font-mono">
            {stats.todayMinutes} <span className="text-sm font-normal text-cyan-300">mins</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            {stats.todayHours} hrs today
          </p>
        </div>

        {/* Streak */}
        <div className="glass-panel p-5 rounded-2xl border border-white/10 relative overflow-hidden shadow-glass">
          <div className="absolute top-0 right-0 p-3 opacity-15">
            <Flame className="w-12 h-12 text-amber-400" />
          </div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Daily Streak</p>
          <div className="text-3xl font-black text-amber-400 mt-2 font-mono flex items-center gap-2">
            {stats.streak} <span className="text-sm font-normal text-slate-300">days 🔥</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Consistency goal</p>
        </div>

        {/* Total Sessions */}
        <div className="glass-panel p-5 rounded-2xl border border-white/10 relative overflow-hidden shadow-glass">
          <div className="absolute top-0 right-0 p-3 opacity-15">
            <Award className="w-12 h-12 text-purple-400" />
          </div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Completed Sessions</p>
          <div className="text-3xl font-black text-white mt-2 font-mono">
            {stats.totalSessions} <span className="text-sm font-normal text-purple-300">sessions</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Focus intervals</p>
        </div>
      </div>

      {/* Main Analytics Graph Section */}
      <div className="glass-panel p-6 rounded-3xl border border-white/10 shadow-glass">
        {/* Header & Range Selector */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-400">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Study Timer Analytics</h2>
              <p className="text-xs text-slate-400">Track your daily, weekly, and monthly productivity curves</p>
            </div>
          </div>

          {/* Timeframe Toggle Pills */}
          <div className="flex items-center gap-1 p-1 bg-black/40 rounded-xl border border-white/10">
            {(['daily', 'weekly', 'monthly'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setViewRange(tab)}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold capitalize transition ${
                  viewRange === tab
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {tab} View
              </button>
            ))}
          </div>
        </div>

        {/* Main Chart Graphic */}
        <div className="h-72 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={activeChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="focusGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#818cf8" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#818cf8" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
              <XAxis 
                dataKey="label" 
                stroke="#64748b" 
                fontSize={12} 
                tickLine={false} 
                axisLine={false}
              />
              <YAxis 
                stroke="#64748b" 
                fontSize={12} 
                tickLine={false} 
                axisLine={false} 
                unit="h"
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="glass-panel p-3 rounded-xl border border-white/20 shadow-2xl text-xs">
                        <p className="font-bold text-white mb-1">{data.label}</p>
                        <p className="text-indigo-300 font-mono">
                          {data.hours} hrs ({data.minutes} mins)
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area 
                type="monotone" 
                dataKey="hours" 
                stroke="#818cf8" 
                strokeWidth={3} 
                fillOpacity={1} 
                fill="url(#focusGradient)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Category Breakdown & Session Log Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Category Breakdown Card */}
        <div className="glass-panel p-6 rounded-3xl border border-white/10 shadow-glass flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <PieIcon className="w-5 h-5 text-purple-400" />
              <h3 className="text-sm font-bold text-white">Focus Category Share</h3>
            </div>

            {categoryData.length > 0 ? (
              <div className="h-52 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={75}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} stroke="rgba(0,0,0,0.4)" strokeWidth={2} />
                      ))}
                    </Pie>
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="glass-panel p-2.5 rounded-lg border border-white/20 text-xs">
                              <p className="font-bold text-white">{data.name}</p>
                              <p className="text-slate-300">{data.hours} hours ({data.value} mins)</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-48 flex items-center justify-center text-xs text-slate-500">
                No categorized sessions yet
              </div>
            )}
          </div>

          {/* Legend */}
          <div className="grid grid-cols-2 gap-2 mt-2 pt-3 border-t border-white/10">
            {categoryData.map(cat => (
              <div key={cat.name} className="flex items-center gap-2 text-xs">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                <span className="text-slate-300 truncate">{cat.name}</span>
                <span className="text-slate-400 ml-auto font-mono text-[11px]">{cat.hours}h</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Session History Log */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-3xl border border-white/10 shadow-glass flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-emerald-400" />
                <h3 className="text-sm font-bold text-white">Recent Study Sessions</h3>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleExportCSV}
                  title="Export sessions to CSV"
                  className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white transition text-xs flex items-center gap-1 border border-white/10"
                >
                  <Download className="w-3.5 h-3.5" /> Export
                </button>
                <button
                  onClick={() => {
                    if (confirm('Clear all study history data?')) clearHistory();
                  }}
                  title="Clear history"
                  className="p-1.5 rounded-lg bg-white/5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition text-xs border border-white/10"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Session Scrollable Items */}
            <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
              {sessions.slice(0, 10).map(s => {
                const date = new Date(s.timestamp);
                const formattedDate = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
                const catColor = CATEGORY_COLORS[s.category] || '#6366f1';

                return (
                  <div
                    key={s.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: catColor }} />
                      <div>
                        <p className="font-semibold text-white truncate max-w-[200px] sm:max-w-xs">
                          {s.taskTitle || `${s.category} Session`}
                        </p>
                        <p className="text-[11px] text-slate-400">
                          {formattedDate} • <span className="capitalize">{s.mode}</span>
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="font-bold text-white font-mono text-sm">
                        +{s.durationMinutes}
                      </span>
                      <span className="text-[10px] text-slate-400 ml-1">mins</span>
                    </div>
                  </div>
                );
              })}

              {sessions.length === 0 && (
                <div className="text-center py-12 text-slate-500 text-xs">
                  No sessions recorded yet. Start a pomodoro or stopwatch session!
                </div>
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs text-slate-400 mt-2">
            <span>Showing latest {Math.min(sessions.length, 10)} sessions</span>
            <span className="text-indigo-400">Auto-saved to browser</span>
          </div>
        </div>
      </div>
    </div>
  );
};
