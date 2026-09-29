'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { soundEngine } from '@/utils/audio';
import { Settings, X, Volume2, Bell, Clock, Play, Check } from 'lucide-react';

export const SettingsModal: React.FC = () => {
  const { 
    timerSettings, 
    updateTimerSettings, 
    isSettingsOpen, 
    setIsSettingsOpen 
  } = useApp();

  if (!isSettingsOpen) return null;

  const testSound = (type: any) => {
    if (soundEngine) {
      soundEngine.playAlarm(type, timerSettings.soundVolume);
    }
  };

  const handleRequestNotification = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        new Notification('TimeTravel Focus', { body: 'Notifications enabled!' });
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="glass-panel w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl border border-white/15 shadow-2xl p-6 relative">
        {/* Close Button */}
        <button
          onClick={() => setIsSettingsOpen(false)}
          className="absolute top-5 right-5 p-2 rounded-xl bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-400">
            <Settings className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Timer Preferences</h2>
            <p className="text-xs text-slate-400">Customize intervals, sound notifications and automation</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Duration settings */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-400" /> Interval Durations (Minutes)
            </h3>

            <div className="grid grid-cols-3 gap-3">
              <div className="glass-panel-subtle p-3 rounded-xl border border-white/10 text-center">
                <label className="text-[11px] text-slate-400 block mb-1">Focus</label>
                <input
                  type="number"
                  min="1"
                  max="120"
                  value={timerSettings.pomodoroMinutes}
                  onChange={(e) => updateTimerSettings({ pomodoroMinutes: Number(e.target.value) || 25 })}
                  className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-center text-sm font-bold text-white font-mono"
                />
              </div>

              <div className="glass-panel-subtle p-3 rounded-xl border border-white/10 text-center">
                <label className="text-[11px] text-slate-400 block mb-1">Short Break</label>
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={timerSettings.shortBreakMinutes}
                  onChange={(e) => updateTimerSettings({ shortBreakMinutes: Number(e.target.value) || 5 })}
                  className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-center text-sm font-bold text-white font-mono"
                />
              </div>

              <div className="glass-panel-subtle p-3 rounded-xl border border-white/10 text-center">
                <label className="text-[11px] text-slate-400 block mb-1">Long Break</label>
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={timerSettings.longBreakMinutes}
                  onChange={(e) => updateTimerSettings({ longBreakMinutes: Number(e.target.value) || 15 })}
                  className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-center text-sm font-bold text-white font-mono"
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-300 pt-2">
              <span>Long Break Interval</span>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  max="12"
                  value={timerSettings.longBreakInterval}
                  onChange={(e) => updateTimerSettings({ longBreakInterval: Number(e.target.value) || 4 })}
                  className="w-16 bg-black/40 border border-white/10 rounded-lg p-1.5 text-center text-xs font-bold text-white font-mono"
                />
                <span className="text-slate-400">sessions</span>
              </div>
            </div>
          </div>

          {/* Sound & Notifications */}
          <div className="space-y-4 pt-3 border-t border-white/10">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-cyan-400" /> Alarm Sound & Audio
            </h3>

            <div>
              <label className="text-xs text-slate-400 block mb-1.5">Alarm Melody</label>
              <div className="grid grid-cols-2 gap-2">
                {(['bell', 'chime', 'digital', 'zen'] as const).map(sound => (
                  <div
                    key={sound}
                    onClick={() => updateTimerSettings({ soundType: sound })}
                    className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer transition ${
                      timerSettings.soundType === sound
                        ? 'bg-indigo-600/30 border-indigo-400 text-white shadow-sm'
                        : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                    }`}
                  >
                    <span className="text-xs font-semibold capitalize">{sound}</span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        testSound(sound);
                      }}
                      className="p-1 rounded-md bg-white/10 hover:bg-white/20 text-slate-200"
                      title="Play Preview"
                    >
                      <Play className="w-3 h-3 fill-current" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Volume */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-slate-300">Alarm Volume</span>
                <span className="font-mono text-indigo-300">{timerSettings.soundVolume}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                value={timerSettings.soundVolume}
                onChange={(e) => updateTimerSettings({ soundVolume: Number(e.target.value) })}
                className="w-full"
              />
            </div>

            {/* Ticking toggle */}
            <div className="flex items-center justify-between text-xs text-slate-300">
              <div>
                <p className="font-semibold">Subtle Clock Ticking</p>
                <p className="text-[11px] text-slate-500">Soft audio feedback during active focus</p>
              </div>
              <button
                type="button"
                onClick={() => updateTimerSettings({ tickingSound: !timerSettings.tickingSound })}
                className={`w-11 h-6 rounded-full transition-colors relative ${
                  timerSettings.tickingSound ? 'bg-indigo-600' : 'bg-white/10'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                    timerSettings.tickingSound ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Automation & Notifications */}
          <div className="space-y-3 pt-3 border-t border-white/10">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Bell className="w-4 h-4 text-emerald-400" /> Automation
            </h3>

            {/* Auto Start Breaks */}
            <div className="flex items-center justify-between text-xs text-slate-300">
              <div>
                <p className="font-semibold">Auto-Start Breaks</p>
                <p className="text-[11px] text-slate-500">Automatically begin break after focus ends</p>
              </div>
              <button
                type="button"
                onClick={() => updateTimerSettings({ autoStartBreaks: !timerSettings.autoStartBreaks })}
                className={`w-11 h-6 rounded-full transition-colors relative ${
                  timerSettings.autoStartBreaks ? 'bg-indigo-600' : 'bg-white/10'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                    timerSettings.autoStartBreaks ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Auto Start Pomodoros */}
            <div className="flex items-center justify-between text-xs text-slate-300">
              <div>
                <p className="font-semibold">Auto-Start Pomodoro</p>
                <p className="text-[11px] text-slate-500">Automatically begin next focus after break</p>
              </div>
              <button
                type="button"
                onClick={() => updateTimerSettings({ autoStartPomodoros: !timerSettings.autoStartPomodoros })}
                className={`w-11 h-6 rounded-full transition-colors relative ${
                  timerSettings.autoStartPomodoros ? 'bg-indigo-600' : 'bg-white/10'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                    timerSettings.autoStartPomodoros ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Browser notification button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleRequestNotification}
                className="w-full py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-slate-300 flex items-center justify-center gap-2 transition"
              >
                <Bell className="w-4 h-4 text-emerald-400" />
                <span>Enable Desktop Notifications</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={() => setIsSettingsOpen(false)}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-xs font-bold text-white shadow-lg hover:opacity-90 transition"
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
};
