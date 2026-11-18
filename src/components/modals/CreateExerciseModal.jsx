import React, { useState } from 'react';
import { useFitmate } from '../../context/FitmateContext';
import { MUSCLE_DATABASE } from '../../data/muscleDatabase';

export const CreateExerciseModal = () => {
  const {
    isCreateExerciseModalOpen,
    setIsCreateExerciseModalOpen,
    addCustomExercise,
    selectedMuscle
  } = useFitmate();

  const [name, setName] = useState('');
  const [primaryMuscle, setPrimaryMuscle] = useState(
    MUSCLE_DATABASE[selectedMuscle]?.name || 'Pecho'
  );
  const [secondaryMuscles, setSecondaryMuscles] = useState('');
  const [equipment, setEquipment] = useState('dumbbell');
  const [instructions, setInstructions] = useState('');
  const [videoUrl, setVideoUrl] = useState('');

  if (!isCreateExerciseModalOpen) return null;

  const equipmentOptions = [
    { id: 'barbell', label: 'Barra' },
    { id: 'dumbbell', label: 'Mancuernas' },
    { id: 'cable', label: 'Polea / Máquina' },
    { id: 'bodyweight', label: 'Peso Corporal' },
    { id: 'kettlebell', label: 'Pesa Rusa (Kettlebell)' },
    { id: 'bands', label: 'Bandas Elásticas' },
    { id: 'other', label: 'Otro' }
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    const stepsArray = instructions
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    addCustomExercise({
      name: name.trim(),
      primaryMuscle,
      secondaryMuscles: secondaryMuscles.trim(),
      equipment,
      eqLabel: equipmentOptions.find((o) => o.id === equipment)?.label || 'Varios',
      level: 'Personalizado',
      steps: stepsArray.length > 0 ? stepsArray : ['Ejecutar con técnica estricta y rango completo.'],
      tip: 'Ejercicio creado por vos en GOT. Mantené el control en la fase excéntrica.',
      videoUrl: videoUrl.trim()
    });

    // Reset and close
    setName('');
    setSecondaryMuscles('');
    setInstructions('');
    setVideoUrl('');
    setIsCreateExerciseModalOpen(false);
  };

  return (
    <div className="fixed inset-0 bg-carbon/85 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-carbonCard border border-forest p-5 rounded-3xl w-full max-w-sm max-h-[90vh] overflow-y-auto space-y-4 shadow-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-moss/20 text-moss flex items-center justify-center">
              <i className="fa-solid fa-plus text-sm"></i>
            </div>
            <h3 className="font-heading font-extrabold text-base text-cream">
              Crear Nuevo Ejercicio
            </h3>
          </div>
          <button
            onClick={() => setIsCreateExerciseModalOpen(false)}
            className="w-8 h-8 rounded-full bg-carbon text-cream/70 hover:text-cream flex items-center justify-center"
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-[11px] font-semibold text-cream/80 mb-1">
              Nombre del ejercicio *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej. Press Guillotina en Multipower"
              className="w-full bg-carbon border border-forest rounded-xl px-3 py-2 text-xs text-cream focus:outline-none focus:border-moss"
            />
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-[11px] font-semibold text-cream/80 mb-1">
                Músculo principal *
              </label>
              <select
                value={primaryMuscle}
                onChange={(e) => setPrimaryMuscle(e.target.value)}
                className="w-full bg-carbon border border-forest rounded-xl px-2.5 py-2 text-xs text-cream focus:outline-none focus:border-moss"
              >
                {Object.values(MUSCLE_DATABASE).map((m) => (
                  <option key={m.name} value={m.name}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-cream/80 mb-1">
                Equipamiento *
              </label>
              <select
                value={equipment}
                onChange={(e) => setEquipment(e.target.value)}
                className="w-full bg-carbon border border-forest rounded-xl px-2.5 py-2 text-xs text-cream focus:outline-none focus:border-moss"
              >
                {equipmentOptions.map((eq) => (
                  <option key={eq.id} value={eq.id}>
                    {eq.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-cream/80 mb-1">
              Músculos secundarios (opcional)
            </label>
            <input
              type="text"
              value={secondaryMuscles}
              onChange={(e) => setSecondaryMuscles(e.target.value)}
              placeholder="Ej. Tríceps, Deltoides frontal"
              className="w-full bg-carbon border border-forest rounded-xl px-3 py-2 text-xs text-cream focus:outline-none focus:border-moss"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-cream/80 mb-1">
              Instrucciones / Pasos (un paso por línea)
            </label>
            <textarea
              rows={3}
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="Paso 1: Colocar el banco...&#10;Paso 2: Agarrar la barra..."
              className="w-full bg-carbon border border-forest rounded-xl px-3 py-2 text-xs text-cream focus:outline-none focus:border-moss"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-cream/80 mb-1">
              Link a video o referencia (opcional)
            </label>
            <input
              type="url"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="https://youtube.com/watch?v=..."
              className="w-full bg-carbon border border-forest rounded-xl px-3 py-2 text-xs text-cream focus:outline-none focus:border-moss"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-moss text-carbon font-heading font-extrabold py-3 rounded-xl shadow-lg hover:bg-moss/90 transition-all flex items-center justify-center gap-2 mt-2"
          >
            <i className="fa-solid fa-floppy-disk"></i> Guardar Ejercicio
          </button>
        </form>
      </div>
    </div>
  );
};
