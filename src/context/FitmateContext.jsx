import React, { createContext, useContext, useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { supabase, updateSupabaseClient, getSupabaseConfig, syncBodyMetricToSupabase } from '../lib/supabase';

const FitmateContext = createContext(null);

const DEFAULT_ROUTINES = {
  push: {
    id: 'push',
    name: 'Empuje (Pecho, Hombro, Tríceps)',
    exercises: [
      {
        id: 'w1',
        name: 'Press de Banca Plano',
        muscle: 'Pecho',
        pr: 82.5,
        lastSession: '3x8 @ 80kg',
        sets: [
          { reps: 10, weight: 75, done: true },
          { reps: 8, weight: 80, done: true },
          { reps: 6, weight: 82.5, done: false }
        ]
      },
      {
        id: 'w2',
        name: 'Press Inclinado con Mancuernas',
        muscle: 'Pecho',
        pr: 30,
        lastSession: '3x10 @ 28kg',
        sets: [
          { reps: 10, weight: 28, done: true },
          { reps: 9, weight: 30, done: false },
          { reps: 8, weight: 30, done: false }
        ]
      },
      {
        id: 'w3',
        name: 'Vuelos Laterales con Mancuernas',
        muscle: 'Hombros',
        pr: 14,
        lastSession: '3x12 @ 12kg',
        sets: [
          { reps: 15, weight: 12, done: true },
          { reps: 12, weight: 14, done: false },
          { reps: 12, weight: 14, done: false }
        ]
      },
      {
        id: 'w4',
        name: 'Extensiones en Polea con Soga',
        muscle: 'Tríceps',
        pr: 32.5,
        lastSession: '3x12 @ 30kg',
        sets: [
          { reps: 12, weight: 30, done: true },
          { reps: 10, weight: 32.5, done: false }
        ]
      }
    ]
  },
  pull: {
    id: 'pull',
    name: 'Tirón (Espalda, Bíceps, Post.)',
    exercises: [
      {
        id: 'w5',
        name: 'Remo con Barra Pendlay / Inclinado',
        muscle: 'Espalda',
        pr: 75,
        lastSession: '3x8 @ 70kg',
        sets: [
          { reps: 10, weight: 70, done: false },
          { reps: 8, weight: 75, done: false }
        ]
      },
      {
        id: 'w6',
        name: 'Jalón al Pecho en Polea',
        muscle: 'Espalda',
        pr: 70,
        lastSession: '3x10 @ 65kg',
        sets: [
          { reps: 10, weight: 65, done: false },
          { reps: 8, weight: 70, done: false }
        ]
      },
      {
        id: 'w7',
        name: 'Curl con Barra Recta o EZ',
        muscle: 'Bíceps',
        pr: 35,
        lastSession: '3x10 @ 32.5kg',
        sets: [
          { reps: 10, weight: 32.5, done: false },
          { reps: 8, weight: 35, done: false }
        ]
      }
    ]
  },
  legs: {
    id: 'legs',
    name: 'Piernas & Core Completo',
    exercises: [
      {
        id: 'w8',
        name: 'Sentadilla Libre con Barra',
        muscle: 'Cuádriceps',
        pr: 110,
        lastSession: '3x6 @ 105kg',
        sets: [
          { reps: 8, weight: 100, done: false },
          { reps: 6, weight: 110, done: false }
        ]
      },
      {
        id: 'w9',
        name: 'Peso Muerto Rumano con Barra',
        muscle: 'Isquiotibiales',
        pr: 95,
        lastSession: '3x8 @ 90kg',
        sets: [
          { reps: 8, weight: 90, done: false },
          { reps: 8, weight: 95, done: false }
        ]
      },
      {
        id: 'w10',
        name: 'Elevación de Talones de Pie',
        muscle: 'Gemelos',
        pr: 80,
        lastSession: '3x15 @ 75kg',
        sets: [
          { reps: 15, weight: 80, done: false },
          { reps: 15, weight: 80, done: false }
        ]
      }
    ]
  }
};

const DEFAULT_METRICS = [
  { date: '2026-09-15', weight: 80.1, armLeft: 35.8, armRight: 36.2, km: 12.0, satisfaction: 7, notes: 'Arrancando firme el bloque de fuerza' },
  { date: '2026-10-15', weight: 79.2, armLeft: 36.2, armRight: 36.6, km: 15.5, satisfaction: 8, notes: 'Mejorando resistencia y press de banca' },
  { date: '2026-11-15', weight: 78.5, armLeft: 36.6, armRight: 37.0, km: 18.5, satisfaction: 9, notes: '¡Nuevo récord en banca y sentadilla!' }
];

export const FitmateProvider = ({ children }) => {
  // Load state from localStorage
  const loadSaved = () => {
    try {
      const saved = localStorage.getItem('fitmate_react_state_v1');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return null;
  };

  const initial = loadSaved();

  const [currentUser, setCurrentUser] = useState(initial?.currentUser || null);
  const [currentTab, setCurrentTab] = useState('explore');
  const [selectedMuscle, setSelectedMuscle] = useState(initial?.selectedMuscle || 'chest');
  const [bodyView, setBodyView] = useState(initial?.bodyView || 'front');
  const [equipmentFilter, setEquipmentFilter] = useState('all');
  const [activeRoutineId, setActiveRoutineId] = useState(initial?.activeRoutineId || 'push');
  const [routines, setRoutines] = useState(initial?.routines || DEFAULT_ROUTINES);
  const [bodyMetrics, setBodyMetrics] = useState(initial?.bodyMetrics || DEFAULT_METRICS);
  const [exerciseHistory, setExerciseHistory] = useState(initial?.exerciseHistory || {
    bench: { labels: ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4', 'Hoy'], data: [72.5, 75, 77.5, 80, 82.5] },
    squat: { labels: ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4', 'Hoy'], data: [95, 100, 102.5, 105, 110] },
    row: { labels: ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4', 'Hoy'], data: [60, 65, 67.5, 70, 75] }
  });
  const [monthlyKmGoal, setMonthlyKmGoal] = useState(initial?.monthlyKmGoal || 30);
  const [totalPrsCount, setTotalPrsCount] = useState(initial?.totalPrsCount || 6);

  // Modals state
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isRoutineModalOpen, setIsRoutineModalOpen] = useState(false);
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);

  // Toast
  const [toast, setToast] = useState({ show: false, message: '' });

  const showToast = (message) => {
    setToast({ show: true, message });
    setTimeout(() => {
      setToast({ show: false, message: '' });
    }, 2800);
  };

  // Timer State
  const [timerPreset, setTimerPreset] = useState(90);
  const [timerSeconds, setTimerSeconds] = useState(90);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [isTimerDrawerOpen, setIsTimerDrawerOpen] = useState(false);

  // Audio Beep generator
  const playBeep = (freq = 600, durationMs = 200) => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + (durationMs / 1000));
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + (durationMs / 1000));
    } catch (e) {
      // Audio context may be restricted
    }
  };

  // Timer Interval Effect
  useEffect(() => {
    let interval = null;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            setIsTimerRunning(false);
            playBeep(880, 500);
            showToast('¡Tiempo de descanso terminado! A darle 🔥');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  const toggleTimer = (forceStart = false) => {
    if (forceStart) {
      setIsTimerRunning(true);
      return;
    }
    setIsTimerRunning((prev) => !prev);
  };

  const resetTimer = () => {
    setIsTimerRunning(false);
    setTimerSeconds(timerPreset);
  };

  const changeTimerPreset = (sec) => {
    setTimerPreset(sec);
    setTimerSeconds(sec);
    setIsTimerRunning(false);
  };

  // Save to LocalStorage whenever critical data changes
  useEffect(() => {
    const stateToSave = {
      currentUser,
      selectedMuscle,
      bodyView,
      activeRoutineId,
      routines,
      bodyMetrics,
      exerciseHistory,
      monthlyKmGoal,
      totalPrsCount
    };
    localStorage.setItem('fitmate_react_state_v1', JSON.stringify(stateToSave));
  }, [
    currentUser,
    selectedMuscle,
    bodyView,
    activeRoutineId,
    routines,
    bodyMetrics,
    exerciseHistory,
    monthlyKmGoal,
    totalPrsCount
  ]);

  // Workout Actions
  const updateSetField = (exerciseId, setIndex, field, value) => {
    const val = parseFloat(value) || 0;
    setRoutines((prev) => {
      const updated = { ...prev };
      const routine = updated[activeRoutineId];
      if (!routine) return prev;

      const exercise = routine.exercises.find((e) => e.id === exerciseId);
      if (!exercise || !exercise.sets[setIndex]) return prev;

      exercise.sets[setIndex][field] = val;

      // PR detection
      if (field === 'weight' && val > exercise.pr) {
        exercise.pr = val;
        setTotalPrsCount((c) => c + 1);
        confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
        showToast(`¡Nuevo récord en ${exercise.name}: ${val} kg! 🏆`);
      }

      return updated;
    });
  };

  const toggleSetDone = (exerciseId, setIndex) => {
    setRoutines((prev) => {
      const updated = { ...prev };
      const routine = updated[activeRoutineId];
      if (!routine) return prev;

      const exercise = routine.exercises.find((e) => e.id === exerciseId);
      if (!exercise || !exercise.sets[setIndex]) return prev;

      const nextState = !exercise.sets[setIndex].done;
      exercise.sets[setIndex].done = nextState;

      if (nextState) {
        // Auto-start rest timer
        setTimerSeconds(timerPreset);
        setIsTimerRunning(true);
        playBeep(600, 150);
        showToast('¡Serie completada! Descanso iniciado ⏱️');
      }

      return updated;
    });
  };

  const addSetToExercise = (exerciseId) => {
    setRoutines((prev) => {
      const updated = { ...prev };
      const routine = updated[activeRoutineId];
      if (!routine) return prev;

      const exercise = routine.exercises.find((e) => e.id === exerciseId);
      if (!exercise) return prev;

      const last = exercise.sets[exercise.sets.length - 1] || { reps: 10, weight: 20 };
      exercise.sets.push({ reps: last.reps, weight: last.weight, done: false });

      return updated;
    });
  };

  const addExerciseToRoutine = (exerciseName, muscleName) => {
    setRoutines((prev) => {
      const updated = { ...prev };
      const routine = updated[activeRoutineId];
      if (!routine) return prev;

      if (routine.exercises.some((e) => e.name === exerciseName)) {
        showToast(`Ya está en "${routine.name}"`);
        return prev;
      }

      routine.exercises.push({
        id: 'w_' + Date.now(),
        name: exerciseName,
        muscle: muscleName,
        pr: 0,
        lastSession: 'Primera vez',
        sets: [
          { reps: 10, weight: 20, done: false },
          { reps: 10, weight: 20, done: false },
          { reps: 10, weight: 20, done: false }
        ]
      });

      showToast(`¡Agregado a ${routine.name.split(' ')[0]}!`);
      return updated;
    });
  };

  const finishWorkout = () => {
    setRoutines((prev) => {
      const updated = { ...prev };
      const routine = updated[activeRoutineId];
      if (!routine) return prev;

      routine.exercises.forEach((ex) => {
        const maxW = Math.max(...ex.sets.map((s) => s.weight));
        const avgReps = ex.sets[0]?.reps || 10;
        ex.lastSession = `${ex.sets.length}x${avgReps} @ ${maxW}kg`;
        ex.sets.forEach((s) => (s.done = false));
      });

      return updated;
    });
    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    showToast('¡Sesión guardada! Cada repetición cuenta 💪');
  };

  const createRoutine = (name) => {
    if (!name.trim()) return;
    const id = 'r_' + Date.now();
    setRoutines((prev) => ({
      ...prev,
      [id]: { id, name, exercises: [] }
    }));
    setActiveRoutineId(id);
    showToast(`Rutina "${name}" creada`);
  };

  // Body Metrics Actions
  const addBodyMetric = async (metricData) => {
    setBodyMetrics((prev) => [...prev, metricData]);
    showToast('¡Marcas corporales guardadas! 🎉');
    // Try to sync with Supabase if online
    await syncBodyMetricToSupabase(metricData);
  };

  return (
    <FitmateContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        currentTab,
        setCurrentTab,
        selectedMuscle,
        setSelectedMuscle,
        bodyView,
        setBodyView,
        equipmentFilter,
        setEquipmentFilter,
        activeRoutineId,
        setActiveRoutineId,
        routines,
        bodyMetrics,
        exerciseHistory,
        monthlyKmGoal,
        totalPrsCount,
        toast,
        showToast,
        // Timer
        timerPreset,
        timerSeconds,
        isTimerRunning,
        isTimerDrawerOpen,
        setIsTimerDrawerOpen,
        toggleTimer,
        resetTimer,
        changeTimerPreset,
        // Modals
        isProfileModalOpen,
        setIsProfileModalOpen,
        isRoutineModalOpen,
        setIsRoutineModalOpen,
        isSyncModalOpen,
        setIsSyncModalOpen,
        // Actions
        updateSetField,
        toggleSetDone,
        addSetToExercise,
        addExerciseToRoutine,
        finishWorkout,
        createRoutine,
        addBodyMetric
      }}
    >
      {children}
    </FitmateContext.Provider>
  );
};

export const useFitmate = () => useContext(FitmateContext);
