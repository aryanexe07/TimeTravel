'use client';

import React, { useState, useRef } from 'react';
import { useApp, PRESET_BACKGROUNDS } from '@/context/AppContext';
import { 
  Image as ImageIcon, X, Sliders, Upload, Link as LinkIcon, 
  Check, Sparkles, RefreshCw, Palette, Eye 
} from 'lucide-react';

export const BackgroundManager: React.FC = () => {
  const { 
    bgSettings, 
    updateBgSettings, 
    isBgModalOpen, 
    setIsBgModalOpen 
  } = useApp();

  const [inputUrl, setInputUrl] = useState(bgSettings.customUrl || '');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isBgModalOpen) return null;

  const handleSelectPreset = (presetId: string) => {
    updateBgSettings({
      type: 'preset',
      presetId,
    });
  };

  const handleApplyUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputUrl.trim()) return;
    updateBgSettings({
      type: 'custom-url',
      customUrl: inputUrl.trim(),
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Please choose an image under 5MB.');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          updateBgSettings({
            type: 'custom-upload',
            customUrl: event.target.result as string,
          });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const gradientPresets = [
    { name: 'Deep Cosmic', style: 'linear-gradient(135deg, #090d16 0%, #1e1035 50%, #030712 100%)' },
    { name: 'Cyber Neon', style: 'linear-gradient(135deg, #05141e 0%, #0f2b38 50%, #170d2b 100%)' },
    { name: 'Emerald Night', style: 'linear-gradient(135deg, #021a14 0%, #062b25 50%, #020b12 100%)' },
    { name: 'Midnight Velvet', style: 'linear-gradient(135deg, #180922 0%, #2a0845 50%, #0b0217 100%)' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="glass-panel w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border border-white/15 shadow-2xl p-6 relative">
        {/* Close Button */}
        <button
          onClick={() => setIsBgModalOpen(false)}
          className="absolute top-5 right-5 p-2 rounded-xl bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 shadow-neon-purple">
            <ImageIcon className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Custom Background & Wallpaper</h2>
            <p className="text-xs text-slate-400">Personalize your study environment with curated presets or custom media</p>
          </div>
        </div>

        {/* Preset Wallpapers Gallery */}
        <div className="mb-6">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400" /> Curated Focus Atmospheres
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {PRESET_BACKGROUNDS.map((preset) => {
              const isSelected = bgSettings.type === 'preset' && bgSettings.presetId === preset.id;

              return (
                <button
                  key={preset.id}
                  onClick={() => handleSelectPreset(preset.id)}
                  className={`group relative aspect-video rounded-2xl overflow-hidden border-2 transition-all text-left ${
                    isSelected
                      ? 'border-indigo-500 shadow-neon-purple scale-[1.02]'
                      : 'border-white/10 hover:border-white/30 hover:scale-[1.01]'
                  }`}
                >
                  <img
                    src={preset.thumbnail}
                    alt={preset.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-2.5 flex flex-col justify-end">
                    <span className="text-xs font-bold text-white drop-shadow truncate">{preset.name}</span>
                    <span className="text-[10px] text-cyan-300">{preset.tag}</span>
                  </div>
                  {isSelected && (
                    <div className="absolute top-2 right-2 p-1 rounded-full bg-indigo-600 text-white shadow">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Custom Upload & Custom URL Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          {/* Custom URL */}
          <div className="glass-panel-subtle p-4 rounded-2xl border border-white/10 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-slate-200 mb-2">
                <LinkIcon className="w-4 h-4 text-indigo-400" />
                <span>Custom Image URL</span>
              </div>
              <p className="text-[11px] text-slate-400 mb-3">Paste direct link to any wallpaper image</p>
            </div>

            <form onSubmit={handleApplyUrl} className="flex gap-2">
              <input
                type="url"
                placeholder="https://..."
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
                className="flex-1 px-3 py-2 rounded-xl bg-black/40 border border-white/15 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-400"
              />
              <button
                type="submit"
                className="px-3 py-2 rounded-xl bg-indigo-600 text-xs font-bold text-white hover:bg-indigo-500 transition"
              >
                Apply
              </button>
            </form>
          </div>

          {/* Local File Upload */}
          <div className="glass-panel-subtle p-4 rounded-2xl border border-white/10 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-slate-200 mb-2">
                <Upload className="w-4 h-4 text-cyan-400" />
                <span>Upload From Device</span>
              </div>
              <p className="text-[11px] text-slate-400 mb-3">Upload your favorite local photo (PNG/JPG)</p>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-2 px-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-xs font-bold text-white flex items-center justify-center gap-2 transition"
            >
              <Upload className="w-4 h-4" />
              <span>Browse Image File</span>
            </button>
          </div>
        </div>

        {/* Minimal Gradient Presets */}
        <div className="mb-6">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-2">
            <Palette className="w-4 h-4 text-purple-400" /> Ambient Dark Gradients
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {gradientPresets.map(g => {
              const isSelected = bgSettings.type === 'gradient' && bgSettings.gradientStyle === g.style;
              return (
                <button
                  key={g.name}
                  onClick={() => updateBgSettings({ type: 'gradient', gradientStyle: g.style })}
                  style={{ background: g.style }}
                  className={`h-12 rounded-xl border p-2 flex items-end justify-between transition ${
                    isSelected ? 'border-purple-400 shadow-neon-purple' : 'border-white/15 hover:border-white/30'
                  }`}
                >
                  <span className="text-[10px] font-bold text-white drop-shadow">{g.name}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-white stroke-[3]" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Atmosphere Tuning: Blur & Darkness Controls */}
        <div className="glass-panel-subtle p-5 rounded-2xl border border-white/10 space-y-4">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <Sliders className="w-4 h-4 text-indigo-400" /> Glassmorphism & Darkness Fine-Tuning
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Background Blur */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-slate-300">Background Blur</span>
                <span className="font-mono text-indigo-300">{bgSettings.blur}px</span>
              </div>
              <input
                type="range"
                min="0"
                max="24"
                value={bgSettings.blur}
                onChange={(e) => updateBgSettings({ blur: Number(e.target.value) })}
                className="w-full"
              />
            </div>

            {/* Darkness Overlay */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-slate-300">Darkness Overlay</span>
                <span className="font-mono text-indigo-300">{bgSettings.dimOpacity}%</span>
              </div>
              <input
                type="range"
                min="20"
                max="90"
                value={bgSettings.dimOpacity}
                onChange={(e) => updateBgSettings({ dimOpacity: Number(e.target.value) })}
                className="w-full"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={() => setIsBgModalOpen(false)}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-xs font-bold text-white shadow-lg hover:opacity-90 transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
