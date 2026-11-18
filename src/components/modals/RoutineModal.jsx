import React, { useState } from 'react';
import { useFitmate } from '../../context/FitmateContext';

export const RoutineModal = () => {
  const {
    routines,
    activeRoutineId,
    setActiveRoutineId,
    isRoutineModalOpen,
    setIsRoutineModalOpen,
    createRoutine
  } = useFitmate();

  const [newRoutineName, setNewRoutineName] = useState('');

  if (!isRoutineModalOpen) return null;

  const handleCreate = () => {
    if (!newRoutineName.trim()) return;
    createRoutine(newRoutineName);
    setNewRoutineName('');
    setIsRoutineModalOpen(false);
  };

  return (
    <div className="fixed inset-0 bg-carbon/85 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-carbonCard border border-forest p-5 rounded-3xl w-full max-w-sm space-y-4 shadow-2xl">
        <div className="flex items-center justify-between">
          <h3 className="font-heading font-extrabold text-base text-cream">Elegí tu rutina</h3>
          <button
            onClick={() => setIsRoutineModalOpen(false)}
            className="w-8 h-8 rounded-full bg-carbon text-cream/70 hover:text-cream flex items-center justify-center"
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        {/* Routine Options List */}
        <div className="space-y-2.5 max-h-60 overflow-y-auto">
          {Object.values(routines).map((r) => {
            const isSelected = r.id === activeRoutineId;
            return (
              <button
                key={r.id}
                onClick={() => {
                  setActiveRoutineId(r.id);
                  setIsRoutineModalOpen(false);
                }}
                className={`w-full text-left p-3 rounded-2xl border transition-all flex items-center justify-between ${
                  isSelected
                    ? 'bg-moss/15 border-moss shadow-sm'
                    : 'bg-carbon border-forest hover:border-moss/50'
                }`}
              >
                <div>
                  <p className="font-heading font-bold text-sm text-cream">{r.name}</p>
                  <p className="text-[11px] text-cream/65">
                    {r.exercises.length} {r.exercises.length === 1 ? 'ejercicio' : 'ejercicios'}
                  </p>
                </div>
                {isSelected && <i className="fa-solid fa-circle-check text-moss"></i>}
              </button>
            );
          })}
        </div>

        {/* Create New Routine */}
        <div className="pt-2 border-t border-forest/60">
          <div className="flex gap-2">
            <input
              type="text"
              value={newRoutineName}
              onChange={(e) => setNewRoutineName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
              placeholder="Nombre nueva rutina..."
              className="flex-1 bg-carbon border border-forest rounded-xl px-3 py-2 text-xs text-cream focus:outline-none focus:border-moss"
            />
            <button
              onClick={handleCreate}
              className="bg-moss text-carbon font-bold text-xs px-3 py-2 rounded-xl hover:bg-moss/90 transition-all active:scale-95"
            >
              Crear
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
