import React, { useState } from 'react';
import { useFitmate } from '../../context/FitmateContext';

export const BodyModule = () => {
  const { bodyMetrics, monthlyKmGoal, addBodyMetric } = useFitmate();

  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [weight, setWeight] = useState('');
  const [km, setKm] = useState('');
  const [armLeft, setArmLeft] = useState('');
  const [armRight, setArmRight] = useState('');
  const [satisfaction, setSatisfaction] = useState(8);
  const [notes, setNotes] = useState('');

  const latestMetric = bodyMetrics[bodyMetrics.length - 1] || { km: 0 };
  const currentKm = latestMetric.km || 0;
  const progressPct = Math.min(Math.round((currentKm / monthlyKmGoal) * 100), 100);

  const getSatisfactionMessage = (val) => {
    if (val <= 2) return '"Tranqui, todos tenemos semanas difíciles. ¡A seguir sumando!"';
    if (val <= 5) return '"Paso a paso. Ajustemos descanso y nutrición."';
    if (val <= 7) return '"¡Buen ritmo! Se empieza a notar el trabajo constante."';
    if (val <= 9) return '"¡Estás mejorando muchísimo! Seguí así, crack."';
    return '"¡Nivel máximo! Estás en tu mejor momento 💪"';
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!weight || !km || !armLeft || !armRight) return;

    addBodyMetric({
      date,
      weight: parseFloat(weight),
      km: parseFloat(km),
      armLeft: parseFloat(armLeft),
      armRight: parseFloat(armRight),
      satisfaction: parseInt(satisfaction),
      notes: notes.trim()
    });

    // Reset form
    setWeight('');
    setKm('');
    setArmLeft('');
    setArmRight('');
    setNotes('');
    setSatisfaction(8);
  };

  return (
    <section className="space-y-4 animate-fadeIn">
      {/* Title Header */}
      <div className="bg-forest/60 p-4 rounded-2xl border border-moss/30">
        <span className="text-[10px] font-bold uppercase tracking-wider text-moss">
          Seguimiento Físico
        </span>
        <h2 className="text-lg font-heading font-extrabold text-cream mt-0.5">
          Tus Marcas Corporales
        </h2>
        <p className="text-xs text-cream/75 mt-0.5">
          Registrá peso, brazos por separado, km corridos y cómo te sentís con tu avance.
        </p>
      </div>

      {/* Monthly Running Goal Card */}
      <div className="bg-carbonCard p-4 rounded-2xl border border-forest space-y-2.5 shadow-md">
        <div className="flex items-center justify-between">
          <span className="text-xs font-heading font-bold text-cream flex items-center gap-1.5">
            <i className="fa-solid fa-person-running text-moss"></i> Control Mensual de Running
          </span>
          <span className="text-xs font-bold text-moss">
            {currentKm} / {monthlyKmGoal} km
          </span>
        </div>
        <div className="w-full bg-carbon h-2.5 rounded-full overflow-hidden border border-forest">
          <div
            className="bg-moss h-full rounded-full transition-all duration-700 ease-out"
            style={{ width: `${progressPct}%` }}
          ></div>
        </div>
        <p className="text-[11px] text-cream/65">
          Tu progreso, a tu ritmo. Sumá tus kilómetros cada mes.
        </p>
      </div>

      {/* New Body Check-in Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-carbonCard p-4 rounded-2xl border border-forest space-y-3.5 shadow-lg"
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
            className="bg-carbon border border-forest rounded-lg px-2 py-1 text-xs text-cream focus:outline-none focus:border-moss"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-semibold text-cream/80 mb-1">
              Peso Corporal (kg)
            </label>
            <input
              type="number"
              step="0.1"
              required
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="Ej. 78.5"
              className="w-full bg-carbon border border-forest rounded-xl px-3 py-2 text-sm text-cream focus:outline-none focus:border-moss"
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-cream/80 mb-1">
              Km Corridos (Mes)
            </label>
            <input
              type="number"
              step="0.1"
              required
              value={km}
              onChange={(e) => setKm(e.target.value)}
              placeholder="Ej. 6.5"
              className="w-full bg-carbon border border-forest rounded-xl px-3 py-2 text-sm text-cream focus:outline-none focus:border-moss"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-semibold text-cream/80 mb-1">
              Brazo Izquierdo (cm)
            </label>
            <input
              type="number"
              step="0.1"
              required
              value={armLeft}
              onChange={(e) => setArmLeft(e.target.value)}
              placeholder="Ej. 36.5"
              className="w-full bg-carbon border border-forest rounded-xl px-3 py-2 text-sm text-cream focus:outline-none focus:border-moss"
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-cream/80 mb-1">
              Brazo Derecho (cm)
            </label>
            <input
              type="number"
              step="0.1"
              required
              value={armRight}
              onChange={(e) => setArmRight(e.target.value)}
              placeholder="Ej. 37.0"
              className="w-full bg-carbon border border-forest rounded-xl px-3 py-2 text-sm text-cream focus:outline-none focus:border-moss"
            />
          </div>
        </div>

        {/* Satisfaction Slider */}
        <div className="bg-carbon/70 p-3 rounded-xl border border-forest/70 space-y-1.5">
          <div className="flex justify-between items-center">
            <label className="text-xs font-semibold text-cream/90">
              Nivel de satisfacción (pesos y físico)
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
            {getSatisfactionMessage(satisfaction)}
          </p>
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-cream/80 mb-1">
            Notas personales (opcional)
          </label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Ej. Me sentí con mucha fuerza en banca..."
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
        <h3 className="font-heading font-bold text-sm text-cream/90 px-1">Historial de Controles</h3>
        <div className="space-y-2.5">
          {[...bodyMetrics].reverse().map((metric, idx) => (
            <div
              key={idx}
              className="bg-carbonCard p-3.5 rounded-2xl border border-forest space-y-2 shadow"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-moss">
                  <i className="fa-regular fa-calendar"></i> {metric.date}
                </span>
                <span className="text-[10px] font-bold bg-moss/20 text-moss px-2.5 py-0.5 rounded-full">
                  Satisfacción: {metric.satisfaction}/10
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-xs bg-carbon/60 p-2 rounded-xl border border-forest/50">
                <div>
                  <span className="text-cream/60 block text-[10px]">Peso</span>
                  <b>{metric.weight} kg</b>
                </div>
                <div>
                  <span className="text-cream/60 block text-[10px]">Brazos (I / D)</span>
                  <b>
                    {metric.armLeft} / {metric.armRight} cm
                  </b>
                </div>
                <div>
                  <span className="text-cream/60 block text-[10px]">Running Mes</span>
                  <b>{metric.km} km</b>
                </div>
              </div>

              {metric.notes && (
                <p className="text-[11px] text-cream/75 italic">"{metric.notes}"</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
