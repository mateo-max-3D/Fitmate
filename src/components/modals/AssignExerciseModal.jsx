import React, { useState } from 'react';
import { useFitmate } from '../../context/FitmateContext';

export const AssignExerciseModal = ({ exercise, isOpen, onClose }) => {
  const { routines, addExerciseToRoutine, showToast } = useFitmate();
  const [selectedRoutineId, setSelectedRoutineId] = useState(
    Object.keys(routines)[0] || ''
  );

  if (!isOpen || !exercise) return null;

  const handleAssign = () => {
    if (!selectedRoutineId) {
      showToast('Creá una rutina primero desde el Gestor de Rutinas');
      return;
    }
    addExerciseToRoutine(selectedRoutineId, exercise);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-carbon/85 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-carbonCard border border-forest p-5 rounded-3xl w-full max-w-sm space-y-4 shadow-2xl">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-moss">
              Asignar Ejercicio
            </span>
            <h3 className="font-heading font-extrabold text-sm text-cream truncate">
              {exercise.name}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-carbon text-cream/70 hover:text-cream flex items-center justify-center"
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        <div className="space-y-2">
          <label className="block text-[11px] font-semibold text-cream/80">
            Elegí la rutina destino:
          </label>
          <div className="space-y-2 max-h-56 overflow-y-auto">
            {Object.values(routines).length === 0 ? (
              <p className="text-xs text-cream/60 py-2">No tenés rutinas creadas todavía.</p>
            ) : (
              Object.values(routines).map((r) => {
                const isSelected = selectedRoutineId === r.id;
                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setSelectedRoutineId(r.id)}
                    className={`w-full text-left p-3 rounded-2xl border transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-moss/20 border-moss text-cream'
                        : 'bg-carbon border-forest text-cream/80 hover:border-moss/40'
                    }`}
                  >
                    <div>
                      <p className="font-heading font-bold text-xs">{r.name}</p>
                      <p className="text-[10px] text-cream/60">{r.exercises.length} ejercicios</p>
                    </div>
                    {isSelected && <i className="fa-solid fa-circle-check text-moss"></i>}
                  </button>
                );
              })
            )}
          </div>
        </div>

        <button
          onClick={handleAssign}
          className="w-full bg-moss text-carbon font-heading font-extrabold py-2.5 rounded-xl shadow hover:bg-moss/90 transition-all flex items-center justify-center gap-2 text-xs"
        >
          <i className="fa-solid fa-plus"></i> Agregar a esta rutina
        </button>
      </div>
    </div>
  );
};
