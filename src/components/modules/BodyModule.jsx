import React, { useState } from 'react';
import { useFitmate } from '../../context/FitmateContext';

export const BodyModule = () => {
  const { bodyMetrics, addBodyMetric, monthlyKmGoal, setMonthlyKmGoal } = useFitmate();

  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [weight, setWeight] = useState('');
  const [armLeft, setArmLeft] = useState('');
  const [armRight, setArmRight] = useState('');
  const [kmRun, setKmRun] = useState('');
  const [satisfaction, setSatisfaction] = useState(8);
  const [notes, setNotes] = useState('');
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [goalInput, setGoalInput] = useState(monthlyKmGoal);

  // Calculate monthly km accumulated from entries in current month
  const currentMonthStr = new Date().toISOString().slice(0, 7); // 'YYYY-MM'
  const currentMonthEntries = bodyMetrics.filter((m) => m.date.startsWith(currentMonthStr));
  const accumulatedKmThisMonth = currentMonthEntries.reduce(
    (acc, curr) => acc + (parseFloat(curr.km) || 0),
    0
  );

  const progressPct = Math.min(
    Math.round((accumulatedKmThisMonth / (monthlyKmGoal || 1)) * 100),
    100
  );

  const getSatisfactionFeedback = (score) => {
    if (score <= 2) return '"Tranqui, todos tenemos semanas difíciles. ¡A seguir sumando!"';
    if (score <= 4) return '"Paso a paso. Ajustemos descanso, nutrición y constancia."';
    if (score <= 6) return '"Buen progreso de base. ¡La constancia empieza a pagar!"';
    if (score <= 8) return '"¡Estás mejorando! Se nota la constancia en el gym."';
    return '"¡Nivel máximo! Estás en tu mejor momento de fuerza y forma 💪"';
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!weight || !armLeft || !armRight) return;

    addBodyMetric({
      date,
      weight: parseFloat(weight),
      armLeft: parseFloat(armLeft),
      armRight: parseFloat(armRight),
      km: parseFloat(kmRun) || 0,
      satisfaction: parseInt(satisfaction),
      notes: notes.trim()
    });

    // Reset inputs
    setWeight('');
    setArmLeft('');
    setArmRight('');
    setKmRun('');
    setNotes('');
    setSatisfaction(8);
  };

  const handleSaveGoal = () => {
    const parsed = parseFloat(goalInput);
    if (parsed > 0) {
      setMonthlyKmGoal(parsed);
      setIsEditingGoal(false);
    }
  };

  return (
    <section className="space-y-4 animate-fadeIn">
      {/* Title Header */}
      <div className="bg-forest/60 p-4 rounded-3xl border border-moss/30">
        <span className="text-[10px] font-bold uppercase tracking-wider text-moss">
          Módulo 4 • Biometría
        </span>
        <h2 className="text-lg font-heading font-extrabold text-cream mt-0.5">
          Marcas Corporales & Running
        </h2>
        <p className="text-xs text-cream/75 mt-0.5">
          Registrá peso, simetría de brazos, kilómetros de carrera y tu satisfacción general.
        </p>
      </div>

      {/* Monthly Running Progress Card */}
      <div className="bg-carbonCard p-4 rounded-3xl border border-forest space-y-2.5 shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <i className="fa-solid fa-person-running text-moss"></i>
            <span className="text-xs font-heading font-bold text-cream">
              Control Mensual de Running
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-moss">
              {accumulatedKmThisMonth.toFixed(1)} / {monthlyKmGoal} km
            </span>
            <button
              onClick={() => {
                setGoalInput(monthlyKmGoal);
                setIsEditingGoal(!isEditingGoal);
              }}
              className="text-[10px] text-cream/50 hover:text-moss p-1"
              title="Editar meta mensual"
            >
              <i className="fa-solid fa-pen"></i>
            </button>
          </div>
        </div>

        {/* Inline Goal Editor */}
        {isEditingGoal && (
          <div className="bg-carbon p-2.5 rounded-2xl border border-forest flex items-center gap-2">
            <span className="text-[11px] text-cream/70">Nueva meta (km):</span>
            <input
              type="number"
              step="1"
              value={goalInput}
              onChange={(e) => setGoalInput(e.target.value)}
              className="w-20 bg-carbonCard border border-forest rounded-lg px-2 py-1 text-xs text-cream focus:border-moss focus:outline-none"
            />
            <button
              onClick={handleSaveGoal}
              className="bg-moss text-carbon font-bold text-xs px-2.5 py-1 rounded-lg"
            >
              Guardar
            </button>
          </div>
        )}

        <div className="w-full bg-carbon h-2.5 rounded-full overflow-hidden border border-forest">
          <div
            className="bg-moss h-full rounded-full transition-all duration-700 ease-out shadow-sm"
            style={{ width: `${progressPct}%` }}
          ></div>
        </div>

        <p className="text-[11px] text-cream/65">
          Tu progreso, a tu ritmo. Sumá tus kilómetros cada mes.
        </p>
      </div>

      {/* New Control Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-carbonCard p-4 rounded-3xl border border-forest space-y-3.5 shadow-lg"
      >
        <div className="flex items-center justify-between">
          <h3 className="font-heading font-bold text-sm text-moss flex items-center gap-1.5">
            <i className="fa-solid fa-pen-to-square"></i> Nuevo Control Corporal
          </h3>
          <input
            type="date"
            required
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="bg-carbon border border-forest rounded-xl px-2.5 py-1 text-xs text-cream focus:outline-none focus:border-moss"
          />
        </div>

        {/* Row 1: Weight & Running Km */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-semibold text-cream/80 mb-1">
              Peso Corporal (kg) *
            </label>
            <input
              type="number"
              step="0.1"
              required
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="Ej. 78.5"
              className="w-full bg-carbon border border-forest rounded-xl px-3 py-2 text-sm text-cream focus:outline-none focus:border-moss font-semibold"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-cream/80 mb-1">
              Km Corridos (sesión/mes)
            </label>
            <input
              type="number"
              step="0.1"
              value={kmRun}
              onChange={(e) => setKmRun(e.target.value)}
              placeholder="Ej. 5.0"
              className="w-full bg-carbon border border-forest rounded-xl px-3 py-2 text-sm text-cream focus:outline-none focus:border-moss font-semibold"
            />
          </div>
        </div>

        {/* Row 2: Bilateral Arms */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-semibold text-cream/80 mb-1">
              Brazo Izquierdo (cm) *
            </label>
            <input
              type="number"
              step="0.1"
              required
              value={armLeft}
              onChange={(e) => setArmLeft(e.target.value)}
              placeholder="Ej. 36.5"
              className="w-full bg-carbon border border-forest rounded-xl px-3 py-2 text-sm text-cream focus:outline-none focus:border-moss font-semibold"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-cream/80 mb-1">
              Brazo Derecho (cm) *
            </label>
            <input
              type="number"
              step="0.1"
              required
              value={armRight}
              onChange={(e) => setArmRight(e.target.value)}
              placeholder="Ej. 37.0"
              className="w-full bg-carbon border border-forest rounded-xl px-3 py-2 text-sm text-cream focus:outline-none focus:border-moss font-semibold"
            />
          </div>
        </div>

        {/* Satisfaction Slider 1 - 10 */}
        <div className="bg-carbon/70 p-3 rounded-2xl border border-forest/70 space-y-1.5">
          <div className="flex justify-between items-center">
            <label className="text-xs font-semibold text-cream/90">
              Nivel de satisfacción (pesos y físico):
            </label>
            <span className="text-xs font-heading font-extrabold text-carbon bg-moss px-2.5 py-0.5 rounded-full">
              {satisfaction} / 10
            </span>
          </div>

          <input
            type="range"
            min="1"
            max="10"
            value={satisfaction}
            onChange={(e) => setSatisfaction(e.target.value)}
            className="w-full accent-moss cursor-pointer h-2 bg-forest rounded-lg"
          />

          <p className="text-[11px] text-moss italic text-center">
            {getSatisfactionFeedback(satisfaction)}
          </p>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-[11px] font-semibold text-cream/80 mb-1">
            Notas personales (opcional)
          </label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Ej. Me sentí con buena congestión y energía..."
            className="w-full bg-carbon border border-forest rounded-xl px-3 py-2 text-xs text-cream focus:outline-none focus:border-moss"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-moss text-carbon font-heading font-extrabold py-3 rounded-xl shadow-lg hover:bg-moss/90 transition-all flex items-center justify-center gap-2"
        >
          <i className="fa-solid fa-floppy-disk"></i> Guardar Marcas
        </button>
      </form>

      {/* History List */}
      <div className="space-y-2.5">
        <h3 className="font-heading font-bold text-sm text-cream/90 px-1">
          Historial de Controles
        </h3>

        {bodyMetrics.length === 0 ? (
          <div className="bg-carbonCard p-6 rounded-3xl border border-forest text-center space-y-2">
            <i className="fa-solid fa-ruler text-2xl text-moss/50"></i>
            <p className="text-xs text-cream/70">
              Todavía no registraste controles corporales.
            </p>
            <p className="text-[11px] text-cream/50">
              Cargá tus medidas arriba para comenzar a construir tu historial de evolución.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {[...bodyMetrics].reverse().map((metric) => {
              const armDiff = (metric.armRight - metric.armLeft).toFixed(1);
              return (
                <div
                  key={metric.id}
                  className="bg-carbonCard p-3.5 rounded-3xl border border-forest space-y-2 shadow"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-moss">
                      <i className="fa-regular fa-calendar"></i> {metric.date}
                    </span>
                    <span className="text-[10px] font-bold bg-moss/20 text-moss px-2.5 py-0.5 rounded-full">
                      Satisfacción: {metric.satisfaction}/10
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-xs bg-carbon/60 p-2.5 rounded-2xl border border-forest/50">
                    <div>
                      <span className="text-cream/60 block text-[10px]">Peso</span>
                      <b>{metric.weight} kg</b>
                    </div>
                    <div>
                      <span className="text-cream/60 block text-[10px]">Brazos (I / D)</span>
                      <b>
                        {metric.armLeft} / {metric.armRight} cm
                      </b>
                      <span className="block text-[9px] text-moss/80">
                        {armDiff === '0.0' ? 'Simétrico' : `Dif: ${armDiff > 0 ? '+' : ''}${armDiff}cm`}
                      </span>
                    </div>
                    <div>
                      <span className="text-cream/60 block text-[10px]">Km Corridos</span>
                      <b>{metric.km} km</b>
                    </div>
                  </div>

                  {metric.notes && (
                    <p className="text-[11px] text-cream/75 italic">"{metric.notes}"</p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};
