import React, { useState } from 'react';
import { useFitmate } from '../../context/FitmateContext';
import { MUSCLE_DATABASE } from '../../data/muscleDatabase';

export const TrainingModule = () => {
  const {
    routines,
    createRoutine,
    updateRoutine,
    duplicateRoutine,
    deleteRoutine,
    removeExerciseFromRoutine,
    addExerciseToRoutine,
    activeWorkout,
    startWorkout,
    updateWorkoutSet,
    toggleWorkoutSetDone,
    addWorkoutSet,
    finishActiveWorkout,
    cancelActiveWorkout,
    personalRecords,
    customExercises,
    toggleTimer,
    isTimerRunning,
    timerSeconds,
    showConfirm,
  } = useFitmate();

  const [isCreatingRoutine, setIsCreatingRoutine] = useState(false);
  const [newRoutineName, setNewRoutineName] = useState('');
  const [newRoutineDesc, setNewRoutineDesc] = useState('');
  const [editingRoutineId, setEditingRoutineId] = useState(null);
  const [isAddingExerciseToId, setIsAddingExerciseToId] = useState(null);

  const formatTimer = (sec) => {
    const m = String(Math.floor(sec / 60)).padStart(2, '0');
    const s = String(sec % 60).padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleCreateRoutine = (e) => {
    e.preventDefault();
    if (!newRoutineName.trim()) return;
    createRoutine(newRoutineName, newRoutineDesc);
    setNewRoutineName('');
    setNewRoutineDesc('');
    setIsCreatingRoutine(false);
  };

  // List of all available exercises for the quick add dropdown
  const allAvailableExercises = [];
  Object.values(MUSCLE_DATABASE).forEach((grp) => {
    grp.exercises.forEach((ex) => {
      allAvailableExercises.push({ name: ex.name, muscle: grp.name });
    });
  });
  customExercises.forEach((c) => {
    allAvailableExercises.push({ name: c.name, muscle: c.primaryMuscle });
  });

  // =========================================================================
  // VIEW A: LIVE WORKOUT TRACKING (Si hay un entrenamiento activo)
  // =========================================================================
  if (activeWorkout) {
    return (
      <section className="space-y-4 animate-fadeIn">
        {/* Sticky Live Header */}
        <div className="bg-forest/90 backdrop-blur-md p-4 rounded-3xl border border-moss/40 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-400 animate-ping"></span>
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-moss">
                  Sesión en Vivo
                </span>
                <h2 className="text-base font-heading font-extrabold text-cream leading-none">
                  {activeWorkout.routineName}
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {/* Quick Rest Timer toggle in Live session */}
              <button
                onClick={() => toggleTimer()}
                className="bg-carbon/80 hover:bg-carbon border border-moss/40 px-2.5 py-1.5 rounded-xl text-xs font-bold text-moss flex items-center gap-1.5 transition-all"
                title="Pausar o iniciar descanso"
              >
                <i className="fa-solid fa-stopwatch"></i>
                <span>{formatTimer(timerSeconds)}</span>
              </button>

              <button
                onClick={cancelActiveWorkout}
                className="w-8 h-8 rounded-xl bg-carbon/60 hover:bg-red-950/50 text-red-300 text-xs flex items-center justify-center transition-all"
                title="Cancelar sesión"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
          </div>
        </div>

        {/* Exercises In Workout */}
        <div className="space-y-4">
          {activeWorkout.exercises.map((ex) => {
            const currentPr = personalRecords[ex.name]?.weight;
            return (
              <div
                key={ex.id}
                className="bg-carbonCard p-4 rounded-3xl border border-forest space-y-3.5 shadow-lg"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-bold text-moss uppercase tracking-wider">
                        {ex.muscle}
                      </span>
                      {ex.lastPerformance ? (
                        <span className="text-[10px] bg-carbon px-2 py-0.5 rounded-md text-cream/70 border border-forest">
                          Última vez: {ex.lastPerformance}
                        </span>
                      ) : (
                        <span className="text-[10px] bg-carbon px-2 py-0.5 rounded-md text-cream/50 border border-forest">
                          Primera sesión
                        </span>
                      )}
                    </div>
                    <h3 className="font-heading font-extrabold text-sm text-cream mt-1">
                      {ex.name}
                    </h3>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {currentPr && (
                      <span className="text-[10px] font-bold bg-moss/20 text-moss px-2 py-1 rounded-lg border border-moss/30 flex items-center gap-1">
                        <i className="fa-solid fa-trophy text-[9px]"></i> {currentPr} kg
                      </span>
                    )}
                    <button
                      onClick={() => addWorkoutSet(ex.id)}
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

                  {ex.sets.map((set, sIdx) => {
                    const isPrSet = currentPr && set.weight >= currentPr && set.weight > 0;
                    return (
                      <div
                        key={sIdx}
                        className={`grid grid-cols-12 gap-1.5 items-center p-1.5 rounded-xl border transition-all ${
                          set.done
                            ? 'bg-forest/40 border-moss/40'
                            : 'bg-carbon border-forest/60'
                        }`}
                      >
                        <div className="col-span-2 text-xs font-extrabold text-moss pl-1 flex items-center gap-1">
                          #{sIdx + 1}
                          {isPrSet && (
                            <span title="¡Nuevo récord!" className="text-[9px] text-moss animate-pulse">
                              🔥
                            </span>
                          )}
                        </div>

                        <div className="col-span-4">
                          <input
                            type="number"
                            value={set.reps}
                            onChange={(e) =>
                              updateWorkoutSet(ex.id, sIdx, 'reps', e.target.value)
                            }
                            className="w-full bg-carbonCard border border-forest rounded-lg py-1 text-xs font-bold text-cream text-center focus:border-moss focus:outline-none"
                          />
                        </div>

                        <div className="col-span-4 relative">
                          <input
                            type="number"
                            step="0.5"
                            value={set.weight}
                            onChange={(e) =>
                              updateWorkoutSet(ex.id, sIdx, 'weight', e.target.value)
                            }
                            className="w-full bg-carbonCard border border-forest rounded-lg py-1 text-xs font-bold text-cream text-center focus:border-moss focus:outline-none"
                          />
                        </div>

                        <div className="col-span-2 flex items-center justify-center">
                          <button
                            onClick={() => toggleWorkoutSetDone(ex.id, sIdx)}
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
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Finish Session CTA */}
        <div className="pt-2 space-y-2">
          <button
            onClick={finishActiveWorkout}
            className="w-full bg-moss text-carbon font-heading font-extrabold py-3.5 rounded-2xl shadow-xl shadow-moss/20 hover:bg-moss/90 active:scale-[0.99] transition-all flex items-center justify-center gap-2 text-sm"
          >
            <i className="fa-solid fa-circle-check"></i>
            <span>Guardemos esta sesión</span>
          </button>
          <button
            onClick={cancelActiveWorkout}
            className="w-full bg-transparent hover:bg-carbon text-cream/60 hover:text-red-300 text-xs py-2 rounded-xl transition-all text-center"
          >
            Descartar sesión actual
          </button>
        </div>
      </section>
    );
  }

  // =========================================================================
  // VIEW B: GESTOR DE RUTINAS (Constructor, Edición y Duplicación)
  // =========================================================================
  return (
    <section className="space-y-4 animate-fadeIn">
      {/* Header */}
      <div className="bg-forest/60 p-4 rounded-3xl border border-moss/30 flex items-center justify-between">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-moss">
            Módulo 2 • Entrenamiento
          </span>
          <h2 className="text-lg font-heading font-extrabold text-cream mt-0.5">
            Gestor de Rutinas
          </h2>
          <p className="text-xs text-cream/70 mt-0.5">
            Creá, ordená tus días y entrená con registro de pesos en vivo.
          </p>
        </div>

        <button
          onClick={() => setIsCreatingRoutine(true)}
          className="bg-moss text-carbon font-heading font-extrabold text-xs px-3.5 py-2.5 rounded-2xl shadow-md hover:bg-moss/90 active:scale-95 transition-all flex items-center gap-1.5 shrink-0"
        >
          <i className="fa-solid fa-plus text-xs"></i>
          <span>Nueva Rutina</span>
        </button>
      </div>

      {/* New Routine Inline Creator Form */}
      {isCreatingRoutine && (
        <form
          onSubmit={handleCreateRoutine}
          className="bg-carbonCard p-4 rounded-3xl border border-moss/40 space-y-3 shadow-xl animate-fadeIn"
        >
          <div className="flex items-center justify-between">
            <h3 className="font-heading font-bold text-sm text-cream flex items-center gap-1.5">
              <i className="fa-solid fa-pen-ruler text-moss"></i> Diseñar Nueva Rutina
            </h3>
            <button
              type="button"
              onClick={() => setIsCreatingRoutine(false)}
              className="text-cream/60 hover:text-cream text-xs"
            >
              Cancelar
            </button>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-cream/80 mb-1">
              Nombre de la rutina *
            </label>
            <input
              type="text"
              required
              value={newRoutineName}
              onChange={(e) => setNewRoutineName(e.target.value)}
              placeholder="Ej. Día 1: Torso / Fuerza"
              className="w-full bg-carbon border border-forest rounded-xl px-3 py-2 text-xs text-cream focus:outline-none focus:border-moss"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-cream/80 mb-1">
              Descripción o enfoque (opcional)
            </label>
            <input
              type="text"
              value={newRoutineDesc}
              onChange={(e) => setNewRoutineDesc(e.target.value)}
              placeholder="Ej. Énfasis en banca pesada y accesorios de espalda"
              className="w-full bg-carbon border border-forest rounded-xl px-3 py-2 text-xs text-cream focus:outline-none focus:border-moss"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-moss text-carbon font-heading font-extrabold py-2.5 rounded-xl shadow hover:bg-moss/90 transition-all text-xs"
          >
            Crear Rutina
          </button>
        </form>
      )}

      {/* Routines List */}
      <div className="space-y-3.5">
        {Object.values(routines).length === 0 ? (
          <div className="bg-carbonCard p-8 rounded-3xl border border-forest text-center space-y-3">
            <i className="fa-solid fa-clipboard-list text-3xl text-moss/50"></i>
            <h4 className="font-heading font-bold text-cream text-sm">
              Todavía no tenés rutinas creadas
            </h4>
            <p className="text-xs text-cream/70 max-w-xs mx-auto">
              Tocá el botón <b>"+ Nueva Rutina"</b> arriba para crear tu primer plan de entrenamiento personalizado.
            </p>
          </div>
        ) : (
          Object.values(routines).map((routine) => {
            const isEditing = editingRoutineId === routine.id;

            return (
              <div
                key={routine.id}
                className="bg-carbonCard p-4 rounded-3xl border border-forest space-y-3.5 shadow-md transition-all hover:border-forestLight"
              >
                {/* Routine Card Header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-moss">
                      {routine.exercises.length} {routine.exercises.length === 1 ? 'ejercicio' : 'ejercicios'}
                    </span>
                    <h3 className="font-heading font-extrabold text-base text-cream truncate mt-0.5">
                      {routine.name}
                    </h3>
                    {routine.description && (
                      <p className="text-xs text-cream/65 line-clamp-1 mt-0.5">
                        {routine.description}
                      </p>
                    )}
                  </div>

                  {/* Actions toolbar */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => duplicateRoutine(routine.id)}
                      className="w-7 h-7 rounded-lg bg-carbon hover:bg-forest text-cream/70 hover:text-cream flex items-center justify-center text-xs transition-all"
                      title="Duplicar rutina"
                    >
                      <i className="fa-regular fa-copy"></i>
                    </button>
                    <button
                      onClick={() => setEditingRoutineId(isEditing ? null : routine.id)}
                      className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs transition-all ${
                        isEditing
                          ? 'bg-moss text-carbon font-bold'
                          : 'bg-carbon hover:bg-forest text-cream/70 hover:text-cream'
                      }`}
                      title="Editar ejercicios de la rutina"
                    >
                      <i className="fa-solid fa-pen"></i>
                    </button>
                    <button
                      onClick={() => {
                        showConfirm({
                          title: 'Eliminar rutina',
                          message: `¿Querés eliminar "${routine.name}"? Esta acción no se puede deshacer.`,
                          confirmLabel: 'Eliminar',
                          cancelLabel: 'Cancelar',
                          isDanger: true,
                          onConfirm: () => deleteRoutine(routine.id),
                        });
                      }}
                      className="w-7 h-7 rounded-lg bg-carbon hover:bg-red-950/40 text-cream/50 hover:text-red-300 flex items-center justify-center text-xs transition-all"
                      title="Eliminar rutina"
                    >
                      <i className="fa-solid fa-trash"></i>
                    </button>
                  </div>
                </div>

                {/* Exercises Preview or Editor */}
                <div className="space-y-2">
                  {routine.exercises.map((ex, idx) => (
                    <div
                      key={ex.id || idx}
                      className="bg-carbon/70 p-2.5 rounded-2xl border border-forest/60 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="w-5 h-5 rounded-full bg-forest text-moss flex items-center justify-center text-[10px] font-extrabold shrink-0">
                          {idx + 1}
                        </span>
                        <div className="truncate">
                          <p className="font-semibold text-cream truncate">{ex.name}</p>
                          <p className="text-[10px] text-cream/60">
                            {ex.targetSets || 3} series × {ex.targetReps || 10} reps
                          </p>
                        </div>
                      </div>

                      {isEditing && (
                        <button
                          onClick={() => removeExerciseFromRoutine(routine.id, ex.id)}
                          className="text-red-400 hover:text-red-300 p-1 text-xs transition-all"
                          title="Quitar de la rutina"
                        >
                          <i className="fa-solid fa-xmark"></i>
                        </button>
                      )}
                    </div>
                  ))}

                  {/* Add Exercise inside routine if in editing mode */}
                  {isEditing && (
                    <div className="pt-1">
                      {isAddingExerciseToId === routine.id ? (
                        <div className="bg-carbon p-3 rounded-2xl border border-forest space-y-2">
                          <label className="block text-[11px] font-semibold text-cream/80">
                            Seleccionar ejercicio para agregar:
                          </label>
                          <select
                            onChange={(e) => {
                              if (e.target.value) {
                                addExerciseToRoutine(routine.id, { name: e.target.value });
                                setIsAddingExerciseToId(null);
                              }
                            }}
                            className="w-full bg-carbonCard border border-forest rounded-xl px-2.5 py-2 text-xs text-cream focus:border-moss focus:outline-none"
                            defaultValue=""
                          >
                            <option value="" disabled>
                              -- Elegí un ejercicio del catálogo --
                            </option>
                            {allAvailableExercises.map((ae, i) => (
                              <option key={i} value={ae.name}>
                                {ae.name} ({ae.muscle})
                              </option>
                            ))}
                          </select>
                          <button
                            type="button"
                            onClick={() => setIsAddingExerciseToId(null)}
                            className="text-[11px] text-cream/60 hover:text-cream underline"
                          >
                            Cancelar
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setIsAddingExerciseToId(routine.id)}
                          className="w-full bg-carbon hover:bg-forest/50 text-moss border border-dashed border-moss/40 rounded-xl py-2 text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                        >
                          <i className="fa-solid fa-plus text-xs"></i>
                          <span>Agregar ejercicio a esta rutina</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Primary CTA: START LIVE WORKOUT */}
                <button
                  onClick={() => startWorkout(routine.id)}
                  disabled={routine.exercises.length === 0}
                  className="w-full bg-moss text-carbon font-heading font-extrabold py-2.5 rounded-2xl shadow hover:bg-moss/90 active:scale-[0.99] transition-all flex items-center justify-center gap-2 text-xs disabled:opacity-40 disabled:pointer-events-none"
                >
                  <i className="fa-solid fa-play text-xs"></i>
                  <span>Entrenar esta rutina en vivo</span>
                </button>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
};
