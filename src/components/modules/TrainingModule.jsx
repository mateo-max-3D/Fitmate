import React from 'react';
import { useFitmate } from '../../context/FitmateContext';

export const TrainingModule = () => {
  const {
    routines,
    activeRoutineId,
    setIsRoutineModalOpen,
    updateSetField,
    toggleSetDone,
    addSetToExercise,
    finishWorkout
  } = useFitmate();

  const routine = routines[activeRoutineId] || { name: 'Mi Rutina', exercises: [] };

  return (
    <section className="space-y-4 animate-fadeIn">
      {/* Active Routine Header Card */}
      <div className="bg-forest/60 p-4 rounded-2xl border border-moss/30 flex items-center justify-between">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-moss">
            Rutina Activa
          </span>
          <h2 className="text-lg font-heading font-extrabold text-cream mt-0.5">
            {routine.name}
          </h2>
        </div>
        <button
          onClick={() => setIsRoutineModalOpen(true)}
          className="bg-moss text-carbon font-heading font-bold text-xs px-3 py-2 rounded-xl shadow-md hover:bg-moss/90 active:scale-95 transition-all flex items-center gap-1.5"
        >
          <i className="fa-solid fa-repeat"></i> Rutinas
        </button>
      </div>

      {/* Routine Exercises Log */}
      <div className="space-y-3.5">
        {routine.exercises.length === 0 ? (
          <div className="bg-carbonCard p-6 rounded-2xl border border-forest text-center space-y-3">
            <i className="fa-solid fa-dumbbell text-3xl text-moss/60"></i>
            <h4 className="font-heading font-bold text-cream text-sm">Esta rutina no tiene ejercicios</h4>
            <p className="text-xs text-cream/70">
              Andá a la pestaña <b>Explorar</b>, tocá cualquier grupo muscular y agregá los ejercicios que quieras.
            </p>
          </div>
        ) : (
          routine.exercises.map((ex) => (
            <div
              key={ex.id}
              className="bg-carbonCard p-4 rounded-2xl border border-forest space-y-3 shadow-md"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-moss uppercase tracking-wider">
                      {ex.muscle}
                    </span>
                    <span className="text-[10px] bg-carbon px-2 py-0.5 rounded-full text-cream/70 border border-forest">
                      Última: {ex.lastSession}
                    </span>
                  </div>
                  <h4 className="font-heading font-extrabold text-sm text-cream mt-1">
                    {ex.name}
                  </h4>
                </div>

                <div className="flex items-center gap-1.5">
                  <span
                    className="text-[10px] font-bold bg-moss/15 text-moss px-2 py-1 rounded-lg border border-moss/30"
                    title="Récord Personal"
                  >
                    <i className="fa-solid fa-trophy"></i> {ex.pr} kg
                  </span>
                  <button
                    onClick={() => addSetToExercise(ex.id)}
                    className="w-7 h-7 rounded-lg bg-forest hover:bg-forestLight text-moss flex items-center justify-center text-xs transition-all active:scale-95"
                    title="Agregar serie"
                  >
                    <i className="fa-solid fa-plus"></i>
                  </button>
                </div>
              </div>

              {/* Sets Table */}
              <div className="space-y-1.5">
                <div className="grid grid-cols-12 gap-1.5 text-[10px] font-bold text-cream/55 px-1 uppercase">
                  <div className="col-span-2">Serie</div>
                  <div className="col-span-4 text-center">Reps</div>
                  <div className="col-span-4 text-center">Peso (kg)</div>
                  <div className="col-span-2 text-center">Listo</div>
                </div>

                {ex.sets.map((set, sIdx) => (
                  <div
                    key={sIdx}
                    className={`grid grid-cols-12 gap-1.5 items-center p-1.5 rounded-xl border transition-all ${
                      set.done ? 'bg-forest/35 border-moss/40' : 'bg-carbon border-forest/60'
                    }`}
                  >
                    <div className="col-span-2 text-xs font-extrabold text-moss pl-1">
                      #{sIdx + 1}
                    </div>

                    <div className="col-span-4">
                      <input
                        type="number"
                        value={set.reps}
                        onChange={(e) => updateSetField(ex.id, sIdx, 'reps', e.target.value)}
                        className="w-full bg-carbonCard border border-forest rounded-lg py-1 text-xs font-bold text-cream text-center focus:border-moss focus:outline-none"
                      />
                    </div>

                    <div className="col-span-4">
                      <input
                        type="number"
                        step="0.5"
                        value={set.weight}
                        onChange={(e) => updateSetField(ex.id, sIdx, 'weight', e.target.value)}
                        className="w-full bg-carbonCard border border-forest rounded-lg py-1 text-xs font-bold text-cream text-center focus:border-moss focus:outline-none"
                      />
                    </div>

                    <div className="col-span-2 flex items-center justify-center">
                      <button
                        onClick={() => toggleSetDone(ex.id, sIdx)}
                        className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
                          set.done
                            ? 'bg-moss text-carbon font-bold shadow'
                            : 'bg-carbonCard border border-forest text-cream/40 hover:text-cream'
                        }`}
                      >
                        <i className="fa-solid fa-check text-xs"></i>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Finish Session CTA */}
      <button
        onClick={finishWorkout}
        className="w-full bg-moss text-carbon font-heading font-extrabold py-3.5 rounded-2xl shadow-lg shadow-moss/15 hover:bg-moss/90 active:scale-[0.99] transition-all flex items-center justify-center gap-2"
      >
        <i className="fa-solid fa-circle-check"></i> Guardemos esta sesión
      </button>
    </section>
  );
};
