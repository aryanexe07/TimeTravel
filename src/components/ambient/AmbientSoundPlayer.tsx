'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { CloudRain, Radio, Waves, Coffee, Volume2, VolumeX, Sparkles } from 'lucide-react';

export const AmbientSoundPlayer: React.FC = () => {
  const { ambientState, setAmbientSound, setAmbientVolume, toggleAmbient } = useApp();

  const sounds = [
    { id: 'none', label: 'Mute', icon: VolumeX },
    { id: 'rain', label: 'Rain', icon: CloudRain },
    { id: 'whitenoise', label: 'White Noise', icon: Radio },
    { id: 'binaural', label: '40Hz Gamma', icon: Sparkles },
    { id: 'waves', label: 'Ocean Waves', icon: Waves },
    { id: 'cafe', label: 'Cafe Ambience', icon: Coffee },
  ] as const;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 max-w-xl w-[92%] sm:w-auto">
      <div className="glass-panel px-4 py-2.5 rounded-full border border-white/15 shadow-2xl flex items-center gap-2 sm:gap-4">
        {/* Sound options */}
        <div className="flex items-center gap-1">
          {sounds.map((s) => {
            const Icon = s.icon;
            const isSelected = ambientState.activeSound === s.id;

            return (
              <button
                key={s.id}
                onClick={() => setAmbientSound(s.id as any)}
                title={s.label}
                className={`p-2 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  isSelected && s.id !== 'none'
                    ? 'bg-indigo-600 text-white shadow-neon-purple scale-105'
                    : 'text-slate-400 hover:text-white hover:bg-white/10'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span className="hidden md:inline text-[11px]">{s.label}</span>
              </button>
            );
          })}
        </div>

        {/* Volume slider */}
        {ambientState.activeSound !== 'none' && (
          <div className="flex items-center gap-2 pl-2 border-l border-white/10">
            <Volume2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <input
              type="range"
              min="0"
              max="100"
              value={ambientState.volume}
              onChange={(e) => setAmbientVolume(Number(e.target.value))}
              className="w-16 sm:w-20"
            />
          </div>
        )}
      </div>
    </div>
  );
};
