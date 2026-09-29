'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { Navigation } from '@/components/Navigation';
import { PomodoroTimer } from '@/components/pomodoro/PomodoroTimer';
import { StopwatchTimer } from '@/components/stopwatch/StopwatchTimer';
import { AnalyticsDashboard } from '@/components/analytics/AnalyticsDashboard';
import { TodoList } from '@/components/todo/TodoList';
import { BackgroundBackdrop } from '@/components/background/BackgroundBackdrop';
import { BackgroundManager } from '@/components/background/BackgroundManager';
import { SettingsModal } from '@/components/settings/SettingsModal';
import { AmbientSoundPlayer } from '@/components/ambient/AmbientSoundPlayer';

export default function Home() {
  const { activeTab } = useApp();

  return (
    <main className="relative min-h-screen flex flex-col justify-between pb-24">
      {/* Dynamic Background */}
      <BackgroundBackdrop />

      {/* Top Glass Navigation Bar */}
      <Navigation />

      {/* Main Content Area */}
      <div className="flex-1 w-full max-w-6xl mx-auto px-4 py-6 z-10">
        {activeTab === 'pomodoro' && (
          <div className="animate-in fade-in zoom-in-95 duration-300">
            <PomodoroTimer />
          </div>
        )}

        {activeTab === 'stopwatch' && (
          <div className="animate-in fade-in zoom-in-95 duration-300">
            <StopwatchTimer />
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="animate-in fade-in zoom-in-95 duration-300">
            <AnalyticsDashboard />
          </div>
        )}

        {activeTab === 'todo' && (
          <div className="animate-in fade-in zoom-in-95 duration-300">
            <TodoList />
          </div>
        )}
      </div>

      {/* Floating Ambient Sound Player Bar */}
      <AmbientSoundPlayer />

      {/* Modals */}
      <BackgroundManager />
      <SettingsModal />
    </main>
  );
}
