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

// Register Chart.js modules
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
  const { bodyMetrics, exerciseHistory, totalPrsCount } = useFitmate();
  const [selectedExercise, setSelectedExercise] = useState('bench');

  const latestMetric = bodyMetrics[bodyMetrics.length - 1] || { weight: 78.5, km: 18.5, satisfaction: 9 };
  const prevMetric = bodyMetrics.length > 1 ? bodyMetrics[bodyMetrics.length - 2] : latestMetric;
  const weightDiff = (latestMetric.weight - prevMetric.weight).toFixed(1);

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
        grid: { color: 'rgba(52, 75, 53, 0.3)' }
      },
      y: {
        ticks: { color: '#F5F0E6', font: { size: 10 } },
        grid: { color: 'rgba(52, 75, 53, 0.3)' }
      }
    }
  };

  // Chart 1: Exercise load evolution
  const currentExData = exerciseHistory[selectedExercise] || exerciseHistory.bench;
  const exerciseChartData = {
    labels: currentExData.labels,
    datasets: [
      {
        label: 'Peso Máximo (kg)',
        data: currentExData.data,
        borderColor: '#A5C978',
        backgroundColor: 'rgba(165, 201, 120, 0.18)',
        borderWidth: 3,
        pointBackgroundColor: '#A5C978',
        fill: true,
        tension: 0.35
      }
    ]
  };

  // Chart 2: Arms Left vs Right comparison
  const dateLabels = bodyMetrics.map((m) => m.date.slice(5));
  const armsChartData = {
    labels: dateLabels,
    datasets: [
      {
        label: 'Brazo Izq (cm)',
        data: bodyMetrics.map((m) => m.armLeft),
        backgroundColor: '#A5C978',
        borderRadius: 6
      },
      {
        label: 'Brazo Der (cm)',
        data: bodyMetrics.map((m) => m.armRight),
        backgroundColor: '#4c754e',
        borderRadius: 6
      }
    ]
  };

  // Chart 3: Body weight evolution
  const weightChartData = {
    labels: dateLabels,
    datasets: [
      {
        label: 'Peso Corporal (kg)',
        data: bodyMetrics.map((m) => m.weight),
        borderColor: '#F5F0E6',
        backgroundColor: 'rgba(245, 240, 230, 0.1)',
        borderWidth: 2.5,
        pointBackgroundColor: '#A5C978',
        fill: true,
        tension: 0.3
      }
    ]
  };

  return (
    <section className="space-y-4 animate-fadeIn">
      {/* Title */}
      <div className="bg-forest/60 p-4 rounded-2xl border border-moss/30">
        <span className="text-[10px] font-bold uppercase tracking-wider text-moss">
          Dashboard de Rendimiento
        </span>
        <h2 className="text-lg font-heading font-extrabold text-cream mt-0.5">
          Mirá cómo venís
        </h2>
        <p className="text-xs text-cream/75 mt-0.5">
          Tus avances en cargas, medidas corporales y resistencia aeróbica.
        </p>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 gap-2.5">
        <div className="bg-carbonCard p-3.5 rounded-2xl border border-forest space-y-1">
          <div className="flex items-center justify-between text-moss">
            <span className="text-[11px] font-semibold text-cream/70">Peso Corporal</span>
            <i className="fa-solid fa-weight-scale text-xs"></i>
          </div>
          <div className="text-xl font-heading font-extrabold text-cream">
            {latestMetric.weight} kg
          </div>
          <p className="text-[10px] text-moss font-medium">
            {weightDiff > 0 ? `+${weightDiff}` : weightDiff} kg vs control anterior
          </p>
        </div>

        <div className="bg-carbonCard p-3.5 rounded-2xl border border-forest space-y-1">
          <div className="flex items-center justify-between text-moss">
            <span className="text-[11px] font-semibold text-cream/70">Récords (PRs)</span>
            <i className="fa-solid fa-trophy text-xs"></i>
          </div>
          <div className="text-xl font-heading font-extrabold text-cream">
            {totalPrsCount} récords
          </div>
          <p className="text-[10px] text-moss font-medium">¡Estás mejorando!</p>
        </div>

        <div className="bg-carbonCard p-3.5 rounded-2xl border border-forest space-y-1">
          <div className="flex items-center justify-between text-moss">
            <span className="text-[11px] font-semibold text-cream/70">Km Corridos</span>
            <i className="fa-solid fa-person-running text-xs"></i>
          </div>
          <div className="text-xl font-heading font-extrabold text-cream">
            {latestMetric.km} km
          </div>
          <p className="text-[10px] text-moss font-medium">Acumulado mensual</p>
        </div>

        <div className="bg-carbonCard p-3.5 rounded-2xl border border-forest space-y-1">
          <div className="flex items-center justify-between text-moss">
            <span className="text-[11px] font-semibold text-cream/70">Satisfacción</span>
            <i className="fa-solid fa-face-smile-beam text-xs"></i>
          </div>
          <div className="text-xl font-heading font-extrabold text-cream">
            {latestMetric.satisfaction} / 10
          </div>
          <p className="text-[10px] text-moss font-medium">Bienestar general</p>
        </div>
      </div>

      {/* Chart 1: Exercise Load Evolution */}
      <div className="bg-carbonCard p-4 rounded-2xl border border-forest space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-heading font-bold text-xs text-cream flex items-center gap-1.5">
            <i className="fa-solid fa-dumbbell text-moss"></i> Evolución de Cargas (kg)
          </h3>
          <select
            value={selectedExercise}
            onChange={(e) => setSelectedExercise(e.target.value)}
            className="bg-carbon border border-forest rounded-lg px-2 py-1 text-[11px] text-moss font-semibold focus:outline-none"
          >
            <option value="bench">Press de Banca</option>
            <option value="squat">Sentadilla Libre</option>
            <option value="row">Remo con Barra</option>
          </select>
        </div>
        <div className="h-44 w-full">
          <Line data={exerciseChartData} options={commonOptions} />
        </div>
      </div>

      {/* Chart 2: Arms Comparison */}
      <div className="bg-carbonCard p-4 rounded-2xl border border-forest space-y-3">
        <h3 className="font-heading font-bold text-xs text-cream flex items-center gap-1.5">
          <i className="fa-solid fa-ruler-combined text-moss"></i> Simetría de Brazos (Izq vs. Der en cm)
        </h3>
        <div className="h-40 w-full">
          <Bar data={armsChartData} options={commonOptions} />
        </div>
      </div>

      {/* Chart 3: Body Weight Evolution */}
      <div className="bg-carbonCard p-4 rounded-2xl border border-forest space-y-3">
        <h3 className="font-heading font-bold text-xs text-cream flex items-center gap-1.5">
          <i className="fa-solid fa-chart-area text-moss"></i> Evolución Peso Corporal (kg)
        </h3>
        <div className="h-40 w-full">
          <Line data={weightChartData} options={commonOptions} />
        </div>
      </div>
    </section>
  );
};
