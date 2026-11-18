import React from 'react';
import { useFitmate } from '../../context/FitmateContext';

export const RestTimerDrawer = () => {
  const {
    timerSeconds,
    isTimerRunning,
    isTimerDrawerOpen,
    toggleTimer,
    resetTimer,
    changeTimerPreset
  } = useFitmate();

  if (!isTimerDrawerOpen) return null;

  const formatTime = (sec) => {
    const m = String(Math.floor(sec / 60)).padStart(2, '0');
    const s = String(sec % 60).padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div className="bg-forest/95 backdrop-blur-md border-b border-moss/30 px-4 py-3 transition-all animate-fadeIn">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="text-2xl font-heading font-extrabold text-moss tabular-nums">
            {formatTime(timerSeconds)}
          </div>
          <div className="flex gap-1">
            <button
              onClick={() => changeTimerPreset(60)}
              className="text-[10px] bg-carbon/60 hover:bg-carbon px-2 py-1 rounded-lg text-cream font-semibold transition-all"
            >
              1m
            </button>
            <button
              onClick={() => changeTimerPreset(90)}
              className="text-[10px] bg-carbon/60 hover:bg-carbon px-2 py-1 rounded-lg text-cream font-semibold transition-all"
            >
              1m30
            </button>
            <button
              onClick={() => changeTimerPreset(120)}
              className="text-[10px] bg-carbon/60 hover:bg-carbon px-2 py-1 rounded-lg text-cream font-semibold transition-all"
            >
              2m
            </button>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => toggleTimer()}
            className="bg-moss text-carbon font-bold text-xs px-3 py-1.5 rounded-xl shadow hover:bg-moss/90 active:scale-95 transition-all"
          >
            {isTimerRunning ? 'Pausar' : 'Iniciar'}
          </button>
          <button
            onClick={resetTimer}
            className="bg-carbon/70 hover:bg-carbon text-cream/80 text-xs px-2.5 py-1.5 rounded-xl transition-all"
            title="Reiniciar"
          >
            <i className="fa-solid fa-rotate-left"></i>
          </button>
        </div>
      </div>
    </div>
  );
};
