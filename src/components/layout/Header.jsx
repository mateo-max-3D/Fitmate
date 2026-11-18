import React from 'react';
import { useFitmate } from '../../context/FitmateContext';

export const Header = () => {
  const {
    isDrawerOpen,
    setIsDrawerOpen,
  } = useFitmate();

  return (
    <header className="px-4 pt-4 pb-3 bg-carbon/95 backdrop-blur-md sticky top-0 z-40 border-b border-forest/40 flex items-center gap-3">
      {/* Hamburger Button */}
      <button
        onClick={() => setIsDrawerOpen(!isDrawerOpen)}
        className="w-11 h-11 rounded-2xl bg-forest hover:bg-forestLight flex flex-col items-center justify-center gap-[5px] active:scale-95 transition-all shadow-md"
        title="Abrir menú"
      >
        <span className="block w-5 h-[2px] bg-white rounded-full"></span>
        <span className="block w-5 h-[2px] bg-white rounded-full"></span>
        <span className="block w-5 h-[2px] bg-white rounded-full"></span>
      </button>

      {/* Brand Logo + Text */}
      <div className="flex items-center gap-2">
        <div className="w-9 h-9 rounded-xl overflow-hidden bg-black flex items-center justify-center shrink-0 p-0.5">
          <img
            src={`${import.meta.env.BASE_URL}assets/got-logo.png`}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = `${import.meta.env.BASE_URL}GOT logo.png`;
            }}
            alt="GOT logo"
            className="w-full h-full object-contain"
          />
        </div>
        <div>
          <h1 className="font-heading font-extrabold text-lg tracking-tight text-cream leading-none">
            GOT
          </h1>
          <p className="text-[10px] text-moss font-semibold tracking-wide mt-0.5">
            Your Gym Buddy.
          </p>
        </div>
      </div>
    </header>
  );
};
