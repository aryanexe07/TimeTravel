export type TimerMode = 'pomodoro' | 'shortBreak' | 'longBreak';

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  estPomodoros: number;
  actPomodoros: number;
  category: 'Study' | 'Work' | 'Coding' | 'Reading' | 'Other';
  priority: 'low' | 'medium' | 'high';
  notes?: string;
  createdAt: string;
  completedAt?: string;
}

export interface StudySession {
  id: string;
  timestamp: string; // ISO string
  durationMinutes: number;
  mode: TimerMode | 'stopwatch';
  taskId?: string;
  taskTitle?: string;
  category: string;
}

export interface LapRecord {
  lapNumber: number;
  lapTime: number; // in milliseconds
  overallTime: number; // in milliseconds
}

export interface BackgroundSettings {
  type: 'preset' | 'custom-url' | 'custom-upload' | 'gradient';
  presetId: string;
  customUrl: string;
  blur: number; // px 0-20
  dimOpacity: number; // 0-90%
  gradientStyle?: string;
}

export interface TimerSettings {
  pomodoroMinutes: number;
  shortBreakMinutes: number;
  longBreakMinutes: number;
  longBreakInterval: number;
  autoStartBreaks: boolean;
  autoStartPomodoros: boolean;
  soundVolume: number; // 0 - 100
  soundType: 'digital' | 'bell' | 'chime' | 'zen';
  tickingSound: boolean;
  notificationEnabled: boolean;
}

export interface AmbientSoundState {
  isPlaying: boolean;
  activeSound: 'none' | 'rain' | 'whitenoise' | 'binaural' | 'waves' | 'cafe';
  volume: number; // 0 - 100
}
