'use client';

import React from 'react';
import { useApp, PRESET_BACKGROUNDS } from '@/context/AppContext';

export const BackgroundBackdrop: React.FC = () => {
  const { bgSettings } = useApp();

  let bgImageStyle = '';
  if (bgSettings.type === 'preset') {
    const preset = PRESET_BACKGROUNDS.find(p => p.id === bgSettings.presetId) || PRESET_BACKGROUNDS[0];
    bgImageStyle = `url(${preset.url})`;
  } else if (bgSettings.type === 'custom-url' || bgSettings.type === 'custom-upload') {
    bgImageStyle = bgSettings.customUrl ? `url(${bgSettings.customUrl})` : '';
  }

  const isGradient = bgSettings.type === 'gradient';

  return (
    <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
      {/* Background Image layer with dynamic blur */}
      {!isGradient && bgImageStyle ? (
        <div
          className="absolute inset-0 bg-cover bg-center transition-all duration-700 transform scale-105"
          style={{
            backgroundImage: bgImageStyle,
            filter: `blur(${bgSettings.blur}px)`,
          }}
        />
      ) : (
        <div
          className="absolute inset-0 transition-all duration-700"
          style={{
            background: bgSettings.gradientStyle || 'linear-gradient(135deg, #090d16 0%, #1e1035 50%, #030712 100%)',
          }}
        />
      )}

      {/* Dim Overlay */}
      <div
        className="absolute inset-0 transition-opacity duration-300"
        style={{
          backgroundColor: '#000000',
          opacity: bgSettings.dimOpacity / 100,
        }}
      />

      {/* Ambient glass light grid & subtle neon mesh orbs */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none animate-pulse-slow" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl pointer-events-none animate-pulse-slow" />
      <div className="absolute -top-20 right-1/3 w-80 h-80 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />
    </div>
  );
};
