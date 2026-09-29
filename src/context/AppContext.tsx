'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Task, StudySession, TimerSettings, BackgroundSettings, AmbientSoundState } from '@/types';
import { soundEngine } from '@/utils/audio';

export interface BackgroundPreset {
  id: string;
  name: string;
  thumbnail: string;
  url: string;
  tag: string;
}

export const PRESET_BACKGROUNDS: BackgroundPreset[] = [
  {
    id: 'cyberpunk-city',
    name: 'Cyberpunk Rain Alley',
    thumbnail: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?q=80&w=600&auto=format&fit=crop',
    url: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?q=80&w=2560&auto=format&fit=crop',
    tag: 'Cyberpunk'
  },
  {
    id: 'lofi-night-room',
    name: 'Cozy Lofi Study',
    thumbnail: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?q=80&w=600&auto=format&fit=crop',
    url: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?q=80&w=2560&auto=format&fit=crop',
    tag: 'Cozy'
  },
  {
    id: 'deep-space',
    name: 'Deep Nebula & Stars',
    thumbnail: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?q=80&w=600&auto=format&fit=crop',
    url: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?q=80&w=2560&auto=format&fit=crop',
    tag: 'Cosmic'
  },
  {
    id: 'aurora-borealis',
    name: 'Emerald Aurora Sky',
    thumbnail: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?q=80&w=600&auto=format&fit=crop',
    url: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?q=80&w=2560&auto=format&fit=crop',
    tag: 'Nature'
  },
  {
    id: 'minimal-dark-mesh',
    name: 'Obsidian Fluid Mesh',
    thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600&auto=format&fit=crop',
    url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2560&auto=format&fit=crop',
    tag: 'Abstract'
  },
  {
    id: 'sunset-cyber-grid',
    name: 'Neon Horizon & Mountains',
    thumbnail: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=600&auto=format&fit=crop',
    url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=2560&auto=format&fit=crop',
    tag: 'Synthwave'
  }
];

// Initial mock data for realistic analytics if user is brand new
const generateInitialSessions = (): StudySession[] => {
  const sessions: StudySession[] = [];
  const categories: Array<Task['category']> = ['Study', 'Coding', 'Work', 'Reading'];
  const now = new Date();

  // Generate 25 historical sessions spread across the last 30 days
  for (let i = 28; i >= 0; i--) {
    const day = new Date(now);
    day.setDate(now.getDate() - i);
    
    // 1-3 sessions per day with 70% probability
    if (Math.random() > 0.25) {
      const count = Math.floor(Math.random() * 3) + 1;
      for (let j = 0; j < count; j++) {
        const cat = categories[Math.floor(Math.random() * categories.length)];
        const duration = [25, 25, 45, 50, 25, 60][Math.floor(Math.random() * 6)];
        sessions.push({
          id: `seed-${i}-${j}`,
          timestamp: new Date(day.getTime() + j * 3600000 + 36000000).toISOString(),
          durationMinutes: duration,
          mode: 'pomodoro',
          taskTitle: `${cat} Focus Session`,
          category: cat,
        });
      }
    }
  }
  return sessions;
};

const initialTasks: Task[] = [
  {
    id: 'task-1',
    title: 'Complete System Architecture Design',
    completed: false,
    estPomodoros: 4,
    actPomodoros: 2,
    category: 'Coding',
    priority: 'high',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'task-2',
    title: 'Read Research Papers on Distributed Systems',
    completed: false,
    estPomodoros: 3,
    actPomodoros: 1,
    category: 'Study',
    priority: 'medium',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'task-3',
    title: 'Review Weekly Code Pull Requests',
    completed: true,
    estPomodoros: 2,
    actPomodoros: 2,
    category: 'Work',
    priority: 'low',
    createdAt: new Date().toISOString(),
    completedAt: new Date().toISOString(),
  }
];

interface AppContextType {
  activeTab: 'pomodoro' | 'stopwatch' | 'analytics' | 'todo';
  setActiveTab: (tab: 'pomodoro' | 'stopwatch' | 'analytics' | 'todo') => void;
  tasks: Task[];
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'actPomodoros'>) => void;
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  incrementTaskPomodoro: (id: string) => void;
  activeTaskId: string | null;
  setActiveTaskId: (id: string | null) => void;
  sessions: StudySession[];
  logSession: (session: Omit<StudySession, 'id'>) => void;
  clearHistory: () => void;
  timerSettings: TimerSettings;
  updateTimerSettings: (settings: Partial<TimerSettings>) => void;
  bgSettings: BackgroundSettings;
  updateBgSettings: (settings: Partial<BackgroundSettings>) => void;
  ambientState: AmbientSoundState;
  setAmbientSound: (sound: AmbientSoundState['activeSound']) => void;
  setAmbientVolume: (volume: number) => void;
  toggleAmbient: () => void;
  isSettingsOpen: boolean;
  setIsSettingsOpen: (open: boolean) => void;
  isBgModalOpen: boolean;
  setIsBgModalOpen: (open: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<'pomodoro' | 'stopwatch' | 'analytics' | 'todo'>('pomodoro');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isBgModalOpen, setIsBgModalOpen] = useState(false);

  const [timerSettings, setTimerSettings] = useState<TimerSettings>({
    pomodoroMinutes: 25,
    shortBreakMinutes: 5,
    longBreakMinutes: 15,
    longBreakInterval: 4,
    autoStartBreaks: false,
    autoStartPomodoros: false,
    soundVolume: 80,
    soundType: 'bell',
    tickingSound: false,
    notificationEnabled: true,
  });

  const [bgSettings, setBgSettings] = useState<BackgroundSettings>({
    type: 'preset',
    presetId: 'cyberpunk-city',
    customUrl: '',
    blur: 4,
    dimOpacity: 65,
    gradientStyle: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #020617 100%)',
  });

  const [ambientState, setAmbientState] = useState<AmbientSoundState>({
    isPlaying: false,
    activeSound: 'none',
    volume: 50,
  });

  // Load persistent state
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedTasks = localStorage.getItem('tt_tasks');
        setTasks(savedTasks ? JSON.parse(savedTasks) : initialTasks);

        const savedSessions = localStorage.getItem('tt_sessions');
        setSessions(savedSessions ? JSON.parse(savedSessions) : generateInitialSessions());

        const savedTimerSettings = localStorage.getItem('tt_timer_settings');
        if (savedTimerSettings) setTimerSettings(JSON.parse(savedTimerSettings));

        const savedBg = localStorage.getItem('tt_bg_settings');
        if (savedBg) setBgSettings(JSON.parse(savedBg));
      } catch (err) {
        console.error('Failed to load storage state:', err);
      }
    }
  }, []);

  // Save changes
  useEffect(() => {
    if (typeof window !== 'undefined' && tasks.length > 0) {
      localStorage.setItem('tt_tasks', JSON.stringify(tasks));
    }
  }, [tasks]);

  useEffect(() => {
    if (typeof window !== 'undefined' && sessions.length > 0) {
      localStorage.setItem('tt_sessions', JSON.stringify(sessions));
    }
  }, [sessions]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('tt_timer_settings', JSON.stringify(timerSettings));
    }
  }, [timerSettings]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('tt_bg_settings', JSON.stringify(bgSettings));
    }
  }, [bgSettings]);

  const addTask = (taskData: Omit<Task, 'id' | 'createdAt' | 'actPomodoros'>) => {
    const newTask: Task = {
      ...taskData,
      id: `task-${Date.now()}`,
      actPomodoros: 0,
      createdAt: new Date().toISOString(),
    };
    setTasks(prev => [newTask, ...prev]);
  };

  const toggleTask = (id: string) => {
    setTasks(prev =>
      prev.map(t =>
        t.id === id
          ? { ...t, completed: !t.completed, completedAt: !t.completed ? new Date().toISOString() : undefined }
          : t
      )
    );
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
    if (activeTaskId === id) setActiveTaskId(null);
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    setTasks(prev => prev.map(t => (t.id === id ? { ...t, ...updates } : t)));
  };

  const incrementTaskPomodoro = (id: string) => {
    setTasks(prev => prev.map(t => (t.id === id ? { ...t, actPomodoros: t.actPomodoros + 1 } : t)));
  };

  const logSession = (sessionData: Omit<StudySession, 'id'>) => {
    const newSession: StudySession = {
      ...sessionData,
      id: `sess-${Date.now()}`,
    };
    setSessions(prev => [newSession, ...prev]);
  };

  const clearHistory = () => {
    setSessions([]);
    localStorage.removeItem('tt_sessions');
  };

  const updateTimerSettings = (updates: Partial<TimerSettings>) => {
    setTimerSettings(prev => ({ ...prev, ...updates }));
  };

  const updateBgSettings = (updates: Partial<BackgroundSettings>) => {
    setBgSettings(prev => ({ ...prev, ...updates }));
  };

  const setAmbientSound = (sound: AmbientSoundState['activeSound']) => {
    setAmbientState(prev => {
      const nextState = { ...prev, activeSound: sound, isPlaying: sound !== 'none' };
      if (soundEngine) {
        if (sound !== 'none') {
          soundEngine.startAmbient(sound, prev.volume);
        } else {
          soundEngine.stopAmbient();
        }
      }
      return nextState;
    });
  };

  const setAmbientVolume = (volume: number) => {
    setAmbientState(prev => {
      if (soundEngine && prev.isPlaying) {
        soundEngine.setAmbientVolume(volume);
      }
      return { ...prev, volume };
    });
  };

  const toggleAmbient = () => {
    setAmbientState(prev => {
      const nextPlaying = !prev.isPlaying;
      if (soundEngine) {
        if (nextPlaying && prev.activeSound !== 'none') {
          soundEngine.startAmbient(prev.activeSound, prev.volume);
        } else {
          soundEngine.stopAmbient();
        }
      }
      return { ...prev, isPlaying: nextPlaying };
    });
  };

  return (
    <AppContext.Provider
      value={{
        activeTab,
        setActiveTab,
        tasks,
        addTask,
        toggleTask,
        deleteTask,
        updateTask,
        incrementTaskPomodoro,
        activeTaskId,
        setActiveTaskId,
        sessions,
        logSession,
        clearHistory,
        timerSettings,
        updateTimerSettings,
        bgSettings,
        updateBgSettings,
        ambientState,
        setAmbientSound,
        setAmbientVolume,
        toggleAmbient,
        isSettingsOpen,
        setIsSettingsOpen,
        isBgModalOpen,
        setIsBgModalOpen,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
