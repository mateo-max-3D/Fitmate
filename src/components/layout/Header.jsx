import React from 'react';
import { useFitmate } from '../../context/FitmateContext';
import { getSupabaseConfig } from '../../lib/supabase';

export const Header = () => {
  const {
    isDrawerOpen,
    setIsDrawerOpen,
    timerSeconds,
    isTimerDrawerOpen,
    setIsTimerDrawerOpen,
    setIsSyncModalOpen
  } = useFitmate();

  const config = getSupabaseConfig();
  const isCloudConnected = Boolean(config.url && config.key);

  const formatTime = (sec) => {
    const m = String(Math.floor(sec / 60)).padStart(2, '0');
    const s = String(sec % 60).padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <header className="px-4 pt-4 pb-3 bg-carbon/95 backdrop-blur-md sticky top-0 z-40 border-b border-forest/40 flex items-center justify-between">
      {/* Left: Hamburger Button + Brand Logo */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setIsDrawerOpen(!isDrawerOpen)}
          className="w-10 h-10 rounded-xl bg-forest/80 hover:bg-forest text-moss flex items-center justify-center text-lg border border-moss/30 active:scale-95 transition-all shadow-sm"
          title="Abrir menú"
        >
          <i className="fa-solid fa-bars-staggered"></i>
        </button>

        <div className="flex items-center gap-2">
          {/* Brand Logo Thumbnail */}
          <div className="w-9 h-9 rounded-xl overflow-hidden border border-moss/50 shadow-md shadow-moss/20 bg-forest/50 flex items-center justify-center shrink-0 p-0.5">
            <img
              src="/assets/got-logo.png"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = '/GOT logo.png';
              }}
              alt="GOT logo"
              className="w-full h-full object-contain"
            />
          </div>
          <div>
            <h1 className="font-heading font-extrabold text-lg tracking-tight text-cream leading-none">
              got
            </h1>
            <p className="text-[10px] text-moss font-semibold tracking-wide mt-0.5">
              Your Gym Buddy.
            </p>
          </div>
        </div>
      </div>

      {/* Right: Rest Timer Quick Pill + Cloud Sync Status */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setIsTimerDrawerOpen(!isTimerDrawerOpen)}
          className="flex items-center gap-1.5 bg-carbonCard hover:bg-forest/60 px-2.5 py-1.5 rounded-full text-xs font-semibold text-cream/90 border border-forest transition-all"
          title="Temporizador de descanso"
        >
          <i className="fa-solid fa-stopwatch text-moss"></i>
          <span>{formatTime(timerSeconds)}</span>
        </button>

        <button
          onClick={() => setIsSyncModalOpen(true)}
          className="flex items-center gap-1.5 bg-forest/80 hover:bg-forest px-2.5 py-1.5 rounded-full text-[11px] font-semibold text-moss border border-moss/30 transition-all shadow-sm"
          title="Configuración de Supabase / Offline"
        >
          <span className="w-2 h-2 rounded-full bg-moss animate-pulse"></span>
          <span>{isCloudConnected ? 'Nube' : 'Offline'}</span>
        </button>
      </div>
    </header>
  );
};
