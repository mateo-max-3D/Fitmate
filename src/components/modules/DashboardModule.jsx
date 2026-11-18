import React, { useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import { useFitmate } from '../../context/FitmateContext';
import { MUSCLE_DATABASE } from '../../data/muscleDatabase';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export const DashboardModule = () => {
  const { workoutHistory, personalRecords, bodyMetrics, customExercises } = useFitmate();

  // All exercise names list for the dropdown
  const allExercises = [];
  Object.values(MUSCLE_DATABASE).forEach((grp) => {
    grp.exercises.forEach((ex) => allExercises.push(ex.name));
  });
  customExercises.forEach((c) => allExercises.push(c.name));

  const [selectedExercise, setSelectedExercise] = useState(allExercises[0] || 'Press de Banca Plano');

  // KPI Calculations
  const currentMonthStr = new Date().toISOString().slice(0, 7); // 'YYYY-MM'
  const monthlyWorkouts = workoutHistory.filter((w) => w.startedAt?.startsWith(currentMonthStr));
  const totalVolumeThisMonth = monthlyWorkouts.reduce(
    (acc, curr) => acc + (parseFloat(curr.totalVolume) || 0),
    0
  );

  const monthlyKm = bodyMetrics
    .filter((m) => m.date.startsWith(currentMonthStr))
    .reduce((acc, curr) => acc + (parseFloat(curr.km) || 0), 0);

  const totalPrs = Object.keys(personalRecords).length;

  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: '#F5F0E6',
          font: { family: 'Inter', size: 11 }
        }
      }
    },
    scales: {
      x: {
        ticks: { color: '#F5F0E6', font: { size: 10 } },
        grid: { color: 'rgba(52, 75, 53, 0.25)' }
      },
      y: {
        ticks: { color: '#F5F0E6', font: { size: 10 } },
        grid: { color: 'rgba(52, 75, 53, 0.25)' }
      }
    }
  };

  // 1. Data for Strength Evolution by Exercise
  // Find all instances of this exercise in history
  const exerciseDataPoints = [];
  [...workoutHistory].reverse().forEach((w) => {
    const foundEx = w.exercises?.find((e) => e.name === selectedExercise);
    if (foundEx) {
      const maxWeight = Math.max(...foundEx.sets.filter((s) => s.done).map((s) => s.weight || 0), 0);
      if (maxWeight > 0) {
        exerciseDataPoints.push({
          date: w.startedAt.slice(5, 10), // MM-DD
          weight: maxWeight
        });
      }
    }
  });

  const strengthChartData = {
    labels: exerciseDataPoints.map((p) => p.date),
    datasets: [
      {
        label: `${selectedExercise} (kg)`,
        data: exerciseDataPoints.map((p) => p.weight),
        borderColor: '#A5C978',
        backgroundColor: 'rgba(165, 201, 120, 0.2)',
        borderWidth: 3,
        pointBackgroundColor: '#A5C978',
        fill: true,
        tension: 0.35
      }
    ]
  };

  // 2. Data for Body Weight Evolution
  const sortedMetrics = [...bodyMetrics].sort((a, b) => new Date(a.date) - new Date(b.date));
  const weightChartData = {
    labels: sortedMetrics.map((m) => m.date.slice(5)),
    datasets: [
      {
        label: 'Peso Corporal (kg)',
        data: sortedMetrics.map((m) => m.weight),
        borderColor: '#A5C978',
        backgroundColor: 'rgba(165, 201, 120, 0.15)',
        borderWidth: 2.5,
        pointBackgroundColor: '#A5C978',
        fill: true,
        tension: 0.3
      }
    ]
  };

  // 3. Data for Arm Symmetry (Left vs Right)
  const armsChartData = {
    labels: sortedMetrics.map((m) => m.date.slice(5)),
    datasets: [
      {
        label: 'Brazo Izq (cm)',
        data: sortedMetrics.map((m) => m.armLeft),
        borderColor: '#A5C978',
        backgroundColor: '#A5C978',
        borderWidth: 2.5,
        tension: 0.3
      },
      {
        label: 'Brazo Der (cm)',
        data: sortedMetrics.map((m) => m.armRight),
        borderColor: '#648c55',
        backgroundColor: '#648c55',
        borderWidth: 2.5,
        tension: 0.3
      }
    ]
  };

  // 4. Data for Running & Satisfaction Correlation
  const runningChartData = {
    labels: sortedMetrics.map((m) => m.date.slice(5)),
    datasets: [
      {
        type: 'bar',
        label: 'Running (km)',
        data: sortedMetrics.map((m) => m.km),
        backgroundColor: '#A5C978',
        borderRadius: 6,
        yAxisID: 'y'
      },
      {
        type: 'line',
        label: 'Satisfacción (1-10)',
        data: sortedMetrics.map((m) => m.satisfaction),
        borderColor: '#F5F0E6',
        backgroundColor: '#F5F0E6',
        borderWidth: 2,
        tension: 0.3,
        yAxisID: 'y1'
      }
    ]
  };

  const dualAxisOptions = {
    ...commonOptions,
    scales: {
      ...commonOptions.scales,
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        ticks: { color: '#A5C978' },
        grid: { color: 'rgba(52, 75, 53, 0.25)' }
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        min: 1,
        max: 10,
        ticks: { color: '#F5F0E6' },
        grid: { drawOnChartArea: false }
      }
    }
  };

  return (
    <section className="space-y-4 animate-fadeIn">
      {/* Header */}
      <div className="bg-forest/60 p-4 rounded-3xl border border-moss/30">
        <span className="text-[10px] font-bold uppercase tracking-wider text-moss">
          Módulo 5 • Analítica
        </span>
        <h2 className="text-lg font-heading font-extrabold text-cream mt-0.5">
          Mirá cómo venís
        </h2>
        <p className="text-xs text-cream/75 mt-0.5">
          Tus avances en cargas, medidas corporales y correlación de esfuerzo.
        </p>
      </div>

      {/* TOP 4 KPI CARDS */}
      <div className="grid grid-cols-2 gap-2.5">
        <div className="bg-carbonCard p-3.5 rounded-3xl border border-forest space-y-1 shadow-md">
          <div className="flex items-center justify-between text-moss">
            <span className="text-[11px] font-semibold text-cream/70">Sesiones (Mes)</span>
            <i className="fa-solid fa-calendar-check text-xs"></i>
          </div>
          <div className="text-xl font-heading font-extrabold text-cream">
            {monthlyWorkouts.length}
          </div>
          <p className="text-[10px] text-moss font-medium">Entrenamientos hechos</p>
        </div>

        <div className="bg-carbonCard p-3.5 rounded-3xl border border-forest space-y-1 shadow-md">
          <div className="flex items-center justify-between text-moss">
            <span className="text-[11px] font-semibold text-cream/70">Volumen Total</span>
            <i className="fa-solid fa-weight-hanging text-xs"></i>
          </div>
          <div className="text-xl font-heading font-extrabold text-cream">
            {totalVolumeThisMonth.toLocaleString()} kg
          </div>
          <p className="text-[10px] text-moss font-medium">Levantado este mes</p>
        </div>

        <div className="bg-carbonCard p-3.5 rounded-3xl border border-forest space-y-1 shadow-md">
          <div className="flex items-center justify-between text-moss">
            <span className="text-[11px] font-semibold text-cream/70">Récords (PRs)</span>
            <i className="fa-solid fa-trophy text-xs"></i>
          </div>
          <div className="text-xl font-heading font-extrabold text-cream">
            {totalPrs}
          </div>
          <p className="text-[10px] text-moss font-medium">Marcas superadas</p>
        </div>

        <div className="bg-carbonCard p-3.5 rounded-3xl border border-forest space-y-1 shadow-md">
          <div className="flex items-center justify-between text-moss">
            <span className="text-[11px] font-semibold text-cream/70">Km Corridos</span>
            <i className="fa-solid fa-person-running text-xs"></i>
          </div>
          <div className="text-xl font-heading font-extrabold text-cream">
            {monthlyKm.toFixed(1)} km
          </div>
          <p className="text-[10px] text-moss font-medium">Acumulado mensual</p>
        </div>
      </div>

      {/* CHART 1: Evolución de Fuerza por Ejercicio */}
      <div className="bg-carbonCard p-4 rounded-3xl border border-forest space-y-3 shadow-md">
        <div className="flex items-center justify-between gap-2">
          <h3 className="font-heading font-bold text-xs text-cream flex items-center gap-1.5 shrink-0">
            <i className="fa-solid fa-dumbbell text-moss"></i> Evolución de Fuerza
          </h3>
          <select
            value={selectedExercise}
            onChange={(e) => setSelectedExercise(e.target.value)}
            className="bg-carbon border border-forest rounded-xl px-2.5 py-1 text-[11px] text-moss font-semibold focus:outline-none max-w-[170px] truncate"
          >
            {allExercises.map((name, i) => (
              <option key={i} value={name}>
                {name}
              </option>
            ))}
          </select>
        </div>

        <div className="h-44 w-full">
          {exerciseDataPoints.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-3 text-cream/50 space-y-1">
              <i className="fa-solid fa-chart-line text-2xl text-moss/30"></i>
              <p className="text-xs">
                Todavía no hay registros guardados de <b>"{selectedExercise}"</b>.
              </p>
              <p className="text-[10px] text-cream/40">
                Al completar tu primera sesión en vivo, se graficará tu curva de cargas.
              </p>
            </div>
          ) : (
            <Line data={strengthChartData} options={commonOptions} />
          )}
        </div>
      </div>

      {/* CHART 2: Evolución de Peso Corporal */}
      <div className="bg-carbonCard p-4 rounded-3xl border border-forest space-y-3 shadow-md">
        <h3 className="font-heading font-bold text-xs text-cream flex items-center gap-1.5">
          <i className="fa-solid fa-weight-scale text-moss"></i> Evolución de Peso Corporal (kg)
        </h3>
        <div className="h-40 w-full">
          {bodyMetrics.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-3 text-cream/50 space-y-1">
              <i className="fa-solid fa-chart-area text-2xl text-moss/30"></i>
              <p className="text-xs">Sin registros de peso aún.</p>
              <p className="text-[10px] text-cream/40">
                Registrá tu peso en el Módulo 4 para ver la curva de tendencia.
              </p>
            </div>
          ) : (
            <Line data={weightChartData} options={commonOptions} />
          )}
        </div>
      </div>

      {/* CHART 3: Comparativa de Simetría de Brazos (Doble línea) */}
      <div className="bg-carbonCard p-4 rounded-3xl border border-forest space-y-3 shadow-md">
        <h3 className="font-heading font-bold text-xs text-cream flex items-center gap-1.5">
          <i className="fa-solid fa-ruler-combined text-moss"></i> Comparativa de Simetría de Brazos (Izq vs. Der en cm)
        </h3>
        <div className="h-40 w-full">
          {bodyMetrics.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-3 text-cream/50 space-y-1">
              <i className="fa-solid fa-arrows-left-right text-2xl text-moss/30"></i>
              <p className="text-xs">Sin medidas de brazos registradas.</p>
              <p className="text-[10px] text-cream/40">
                Podés comparar el brazo izquierdo vs derecho cargando tus marcas en el Módulo 4.
              </p>
            </div>
          ) : (
            <Line data={armsChartData} options={commonOptions} />
          )}
        </div>
      </div>

      {/* CHART 4: Running Mensual y Nivel de Satisfacción */}
      <div className="bg-carbonCard p-4 rounded-3xl border border-forest space-y-3 shadow-md">
        <h3 className="font-heading font-bold text-xs text-cream flex items-center gap-1.5">
          <i className="fa-solid fa-person-running text-moss"></i> Running (km) & Nivel de Satisfacción (1-10)
        </h3>
        <div className="h-44 w-full">
          {bodyMetrics.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-3 text-cream/50 space-y-1">
              <i className="fa-solid fa-chart-column text-2xl text-moss/30"></i>
              <p className="text-xs">Sin correlación registrada.</p>
              <p className="text-[10px] text-cream/40">
                Correlacioná tus kilómetros corridos con tu satisfacción personal a lo largo del tiempo.
              </p>
            </div>
          ) : (
            <Bar data={runningChartData} options={dualAxisOptions} />
          )}
        </div>
      </div>
    </section>
  );
};
