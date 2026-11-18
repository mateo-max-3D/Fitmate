import React, { useState } from 'react';
import { useFitmate } from '../../context/FitmateContext';
import { MUSCLE_DATABASE } from '../../data/muscleDatabase';
import { AnatomicalBody } from '../svg/AnatomicalBody';
import { CreateExerciseModal } from '../modals/CreateExerciseModal';
import { AssignExerciseModal } from '../modals/AssignExerciseModal';

export const ExploreModule = () => {
  const {
    selectedMuscle,
    setSelectedMuscle,
    bodyView,
    setBodyView,
    equipmentFilter,
    setEquipmentFilter,
    customExercises,
    setIsCreateExerciseModalOpen
  } = useFitmate();

  const [assigningExercise, setAssigningExercise] = useState(null);

  const muscle = MUSCLE_DATABASE[selectedMuscle] || MUSCLE_DATABASE.chest;

  // Combine standard exercises with custom exercises for this muscle
  const muscleCustom = customExercises.filter(
    (c) => c.primaryMuscle.toLowerCase() === muscle.name.toLowerCase()
  );

  const allMuscleExercises = [...muscleCustom, ...muscle.exercises];

  const filteredExercises = equipmentFilter === 'all'
    ? allMuscleExercises
    : allMuscleExercises.filter((ex) => ex.equipment === equipmentFilter);

  const equipmentOptions = [
    { id: 'all', label: 'Todos' },
    { id: 'barbell', label: 'Barra' },
    { id: 'dumbbell', label: 'Mancuernas' },
    { id: 'cable', label: 'Polea / Máquina' },
    { id: 'bodyweight', label: 'Peso Corporal' }
  ];

  return (
    <section className="space-y-4 animate-fadeIn">
      {/* Header & View Toggle */}
      <div className="flex items-center justify-between bg-carbonCard p-3 rounded-2xl border border-forest">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-moss">
            Módulo 1 • MuscleWiki
          </span>
          <h2 className="text-base font-heading font-bold text-cream leading-tight">
            ¿Qué entrenamos hoy?
          </h2>
        </div>

        {/* Front / Back Switch */}
        <div className="flex items-center bg-carbon p-1 rounded-xl border border-forest">
          <button
            onClick={() => setBodyView('front')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              bodyView === 'front'
                ? 'bg-moss text-carbon shadow'
                : 'text-cream/70 hover:text-cream'
            }`}
          >
            Frente
          </button>
          <button
            onClick={() => setBodyView('back')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              bodyView === 'back'
                ? 'bg-moss text-carbon shadow'
                : 'text-cream/70 hover:text-cream'
            }`}
          >
            Espalda
          </button>
        </div>
      </div>

      {/* Anatomical Interactive Male Body */}
      <AnatomicalBody />

      {/* Quick Muscle Chips */}
      <div className="w-full pt-1 pb-1 flex gap-1.5 overflow-x-auto no-scrollbar">
        {Object.entries(MUSCLE_DATABASE).map(([key, data]) => {
          const isSelected = key === selectedMuscle;
          return (
            <button
              key={key}
              onClick={() => {
                setSelectedMuscle(key);
                if (data.view !== bodyView) {
                  setBodyView(data.view);
                }
              }}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all ${
                isSelected
                  ? 'bg-moss text-carbon shadow'
                  : 'bg-carbon text-cream/75 border border-forest hover:border-moss/50'
              }`}
            >
              {data.name}
            </button>
          );
        })}
      </div>

      {/* Selected Muscle Header, Filter Bar & Create Button */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-heading font-extrabold text-lg text-moss">{muscle.name}</h3>
              <span className="text-xs font-bold bg-forest text-cream px-2 py-0.5 rounded-full">
                {filteredExercises.length}
              </span>
            </div>
            <p className="text-xs text-cream/70">{muscle.subtitle}</p>
          </div>

          {/* Prominent "+ Crear ejercicio" Button */}
          <button
            onClick={() => setIsCreateExerciseModalOpen(true)}
            className="bg-moss text-carbon font-heading font-extrabold text-xs px-3 py-2 rounded-xl shadow-md hover:bg-moss/90 active:scale-95 transition-all flex items-center gap-1.5 shrink-0"
          >
            <i className="fa-solid fa-plus text-xs"></i>
            <span>Crear ejercicio</span>
          </button>
        </div>

        {/* Equipment Filter Pills */}
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1">
          {equipmentOptions.map((opt) => {
            const isActive = equipmentFilter === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => setEquipmentFilter(opt.id)}
                className={`px-3 py-1.5 rounded-xl text-xs whitespace-nowrap transition-all ${
                  isActive
                    ? 'font-bold bg-moss text-carbon shadow'
                    : 'font-semibold bg-carbonCard border border-forest text-cream/80 hover:text-cream'
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>

        {/* Exercises List */}
        <div className="space-y-3">
          {filteredExercises.length === 0 ? (
            <div className="bg-carbonCard p-6 rounded-2xl border border-forest text-center space-y-3">
              <p className="text-xs text-cream/70">
                No hay ejercicios con este equipamiento para {muscle.name}.
              </p>
              <div className="flex justify-center gap-2">
                <button
                  onClick={() => setEquipmentFilter('all')}
                  className="text-xs font-bold text-moss underline"
                >
                  Ver todos los ejercicios
                </button>
                <span className="text-cream/40">•</span>
                <button
                  onClick={() => setIsCreateExerciseModalOpen(true)}
                  className="text-xs font-bold text-moss underline"
                >
                  Crear uno nuevo
                </button>
              </div>
            </div>
          ) : (
            filteredExercises.map((ex) => (
              <div
                key={ex.id}
                className="bg-carbonCard p-4 rounded-2xl border border-forest space-y-3 shadow-md transition-all hover:border-forestLight"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] font-bold bg-forest text-moss px-2 py-0.5 rounded-md">
                        {ex.eqLabel}
                      </span>
                      <span className="text-[10px] font-semibold bg-carbon text-cream/70 px-2 py-0.5 rounded-md border border-forest">
                        {ex.level}
                      </span>
                      {ex.isCustom && (
                        <span className="text-[10px] font-bold bg-moss/20 text-moss px-2 py-0.5 rounded-md border border-moss/30">
                          Personalizado
                        </span>
                      )}
                    </div>
                    <h4 className="font-heading font-extrabold text-sm text-cream mt-1.5">
                      {ex.name}
                    </h4>
                    {ex.secondaryMuscles && (
                      <p className="text-[10px] text-cream/60 mt-0.5">
                        Secundarios: {ex.secondaryMuscles}
                      </p>
                    )}
                  </div>

                  <button
                    onClick={() => setAssigningExercise(ex)}
                    className="bg-moss/20 hover:bg-moss text-moss hover:text-carbon border border-moss/40 font-bold text-[11px] px-2.5 py-1.5 rounded-xl transition-all flex items-center gap-1 shrink-0"
                  >
                    <i className="fa-solid fa-plus"></i> A mi rutina
                  </button>
                </div>

                <div className="space-y-1">
                  <p className="text-[11px] font-bold text-cream/90">Ejecución paso a paso:</p>
                  <ol className="list-decimal list-inside text-xs text-cream/80 space-y-1 leading-relaxed">
                    {ex.steps.map((step, idx) => (
                      <li key={idx}>{step}</li>
                    ))}
                  </ol>
                </div>

                {ex.tip && (
                  <div className="bg-forest/40 p-2.5 rounded-xl border border-moss/20 flex items-start gap-2">
                    <i className="fa-solid fa-bolt text-moss text-xs mt-0.5"></i>
                    <p className="text-[11px] text-cream/90">
                      <span className="font-bold text-moss">Tip Fitmate:</span> {ex.tip}
                    </p>
                  </div>
                )}

                {ex.videoUrl && (
                  <a
                    href={ex.videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] text-moss font-semibold flex items-center gap-1 hover:underline"
                  >
                    <i className="fa-brands fa-youtube"></i> Ver video de técnica
                  </a>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modals */}
      <CreateExerciseModal />
      <AssignExerciseModal
        exercise={assigningExercise}
        isOpen={Boolean(assigningExercise)}
        onClose={() => setAssigningExercise(null)}
      />
    </section>
  );
};
