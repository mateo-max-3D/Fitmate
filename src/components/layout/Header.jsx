import React from 'react';
import { useFitmate } from '../../context/FitmateContext';
import { getSupabaseConfig } from '../../lib/supabase';

export const Header = () => {
  const {
    currentUser,
    timerSeconds,
    isTimerDrawerOpen,
    setIsTimerDrawerOpen,
    setIsProfileModalOpen,
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
      {/* Brand & User Greeting */}
      <div
        className="flex items-center gap-2.5 cursor-pointer"
        onClick={() => setIsProfileModalOpen(true)}
      >
        <div className="w-10 h-10 rounded-xl overflow-hidden border border-moss/50 shadow-md shadow-moss/20 bg-forest/50 flex items-center justify-center shrink-0">
          <img
            src="/assets/logo.jpg"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = '/Logo Fitmate.jpg';
            }}
            alt="Fitmate"
            className="w-full h-full object-cover"
          />
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <h1 className="font-heading font-extrabold text-lg tracking-tight text-cream leading-none">
              fitmate
            </h1>
            <span className="text-[9px] bg-forest text-moss px-1.5 py-0.5 rounded-md font-bold max-w-[90px] truncate">
              {currentUser?.isGuest ? 'Invitado' : currentUser?.name?.split(' ')[0] || 'Atleta'}
            </span>
          </div>
          <p className="text-[10px] text-moss font-semibold tracking-wide mt-0.5">Your Gym Buddy</p>
        </div>
      </div>

      {/* Header Actions */}
      <div className="flex items-center gap-2">
        {/* Timer Pill */}
        <button
          onClick={() => setIsTimerDrawerOpen(!isTimerDrawerOpen)}
          className="flex items-center gap-1.5 bg-carbonCard hover:bg-forest/60 px-2.5 py-1.5 rounded-full text-xs font-semibold text-cream/90 border border-forest transition-all"
          title="Temporizador de descanso"
        >
          <i className="fa-solid fa-stopwatch text-moss"></i>
          <span>{formatTime(timerSeconds)}</span>
        </button>

        {/* Sync Status Badge */}
        <button
          onClick={() => setIsSyncModalOpen(true)}
          className="flex items-center gap-1.5 bg-forest/80 hover:bg-forest px-2.5 py-1.5 rounded-full text-[11px] font-semibold text-moss border border-moss/30 transition-all shadow-sm"
          title="Supabase & Modo Offline"
        >
          <span className="w-2 h-2 rounded-full bg-moss animate-pulse"></span>
          <span>{isCloudConnected ? 'Supabase' : 'Offline listo'}</span>
        </button>

        {/* Profile Button */}
        <button
          onClick={() => setIsProfileModalOpen(true)}
          className="w-8 h-8 rounded-full bg-carbonCard hover:bg-forest border border-forest flex items-center justify-center text-xs text-cream/80 hover:text-moss transition-all"
          title="Mi Perfil"
        >
          <i className="fa-solid fa-user"></i>
        </button>
      </div>
    </header>
  );
};
