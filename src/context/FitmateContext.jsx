import React, { createContext, useContext, useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  supabase,
  generateUUID,
  isValidUUID,
  syncBodyMetricToSupabase,
  fetchUserBodyMetrics,
  syncRoutineToSupabase,
  deleteRoutineFromSupabase,
  fetchUserRoutines,
  syncAllLocalDataToSupabase
} from '../lib/supabase';
import { MUSCLE_DATABASE } from '../data/muscleDatabase';

const FitmateContext = createContext(null);

export const FitmateProvider = ({ children }) => {
  // Read saved state or start completely clean (no dummy data!)
  const loadSavedState = () => {
    try {
      const saved = localStorage.getItem('got_pwa_state_v2') || localStorage.getItem('fitmate_pwa_state_v2');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Migrate: remove hardcoded demo routines (r_empuje, r_tiron, r_piernas)
        const DEMO_IDS = ['r_empuje', 'r_tiron', 'r_piernas'];
        if (parsed.routines) {
          DEMO_IDS.forEach((id) => { delete parsed.routines[id]; });
        }
        return parsed;
      }
    } catch (e) {
      console.error('Error loading local state:', e);
    }
    return null;
  };

  const initial = loadSavedState();

  // 1. User & Authentication
  const [currentUser, setCurrentUser] = useState(initial?.currentUser || null);

  // 2. Navigation Module: 'explore' | 'routines' | 'calendar' | 'body' | 'dashboard'
  const [currentModule, setCurrentModule] = useState(initial?.currentModule || 'explore');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // 3. Anatomical Explorer
  const [selectedMuscle, setSelectedMuscle] = useState(initial?.selectedMuscle || 'chest');
  const [bodyView, setBodyView] = useState(initial?.bodyView || 'front'); // 'front' | 'back'
  const [equipmentFilter, setEquipmentFilter] = useState('all');
  const [customExercises, setCustomExercises] = useState(initial?.customExercises || []);

  // 4. Routines (User's custom routines — start empty, user creates their own)
  const [routines, setRoutines] = useState(initial?.routines || {});

  // 5. Active Live Workout Session (Live Tracking)
  const [activeWorkout, setActiveWorkout] = useState(initial?.activeWorkout || null);
  const [workoutHistory, setWorkoutHistory] = useState(initial?.workoutHistory || []);
  const [personalRecords, setPersonalRecords] = useState(initial?.personalRecords || {});

  // 6. Calendar Planning (Drag & Drop)
  const [calendarSchedules, setCalendarSchedules] = useState(initial?.calendarSchedules || []);

  // 7. Body Metrics & Running (Clean: No mock measurements!)
  const [bodyMetrics, setBodyMetrics] = useState(initial?.bodyMetrics || []);
  const [monthlyKmGoal, setMonthlyKmGoal] = useState(initial?.monthlyKmGoal || 30);

  // 8. Rest Timer
  const [timerSeconds, setTimerSeconds] = useState(90);
  const [timerPreset, setTimerPreset] = useState(90);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [isTimerDrawerOpen, setIsTimerDrawerOpen] = useState(false);

  // 9. Modals & Notifications
  const [isCreateExerciseModalOpen, setIsCreateExerciseModalOpen] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '' });

  // In-app confirm dialog (replaces window.confirm)
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmLabel: 'Confirmar',
    cancelLabel: 'Cancelar',
    isDanger: false,
    onConfirm: null,
  });

  const showConfirm = ({ title, message, confirmLabel = 'Confirmar', cancelLabel = 'Cancelar', isDanger = false, onConfirm }) => {
    setConfirmModal({ isOpen: true, title, message, confirmLabel, cancelLabel, isDanger, onConfirm });
  };

  const closeConfirm = () => {
    setConfirmModal((prev) => ({ ...prev, isOpen: false, onConfirm: null }));
  };

  // Supabase Auth Listener & Bidirectional Cloud Sync
  useEffect(() => {
    if (!supabase) return;

    // Check active session on startup
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        const userObj = {
          id: session.user.id,
          email: session.user.email,
          name: session.user.user_metadata?.full_name || session.user.email.split('@')[0],
          isGuest: false
        };
        setCurrentUser(userObj);

        // Upload any data saved locally up to Supabase immediately!
        syncAllLocalDataToSupabase(routines, bodyMetrics, session.user.id);

        // Fetch cloud data and merge
        fetchUserRoutines(session.user.id).then((cloudRoutines) => {
          if (cloudRoutines && Object.keys(cloudRoutines).length > 0) {
            setRoutines((prev) => ({ ...cloudRoutines, ...prev }));
          }
        });

        fetchUserBodyMetrics(session.user.id).then((cloudMetrics) => {
          if (cloudMetrics && cloudMetrics.length > 0) {
            setBodyMetrics((prev) => {
              const combined = [...prev];
              cloudMetrics.forEach((cm) => {
                if (!combined.some((m) => m.id === cm.id)) combined.push(cm);
              });
              return combined;
            });
          }
        });
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const userObj = {
          id: session.user.id,
          email: session.user.email,
          name: session.user.user_metadata?.full_name || session.user.email.split('@')[0],
          isGuest: false
        };
        setCurrentUser(userObj);
        syncAllLocalDataToSupabase(routines, bodyMetrics, session.user.id);
      }
    });

    return () => subscription?.unsubscribe();
  }, []);

  const showToast = (message) => {
    setToast({ show: true, message });
    setTimeout(() => {
      setToast({ show: false, message: '' });
    }, 2800);
  };

  // Web Audio Tone Synthesizer
  const playBeep = (freq = 600, durationMs = 200) => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.18, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + durationMs / 1000);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + durationMs / 1000);
    } catch (e) {
      // Audio might be blocked prior to user interaction
    }
  };

  // Timer Tick
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

  // Save State to LocalStorage (Offline-First)
  useEffect(() => {
    const stateToSave = {
      currentUser,
      currentModule,
      selectedMuscle,
      bodyView,
      customExercises,
      routines,
      activeWorkout,
      workoutHistory,
      personalRecords,
      calendarSchedules,
      bodyMetrics,
      monthlyKmGoal
    };
    localStorage.setItem('got_pwa_state_v2', JSON.stringify(stateToSave));
  }, [
    currentUser,
    currentModule,
    selectedMuscle,
    bodyView,
    customExercises,
    routines,
    activeWorkout,
    workoutHistory,
    personalRecords,
    calendarSchedules,
    bodyMetrics,
    monthlyKmGoal
  ]);

  // =========================================================================
  // ACTIONS: EXERCISES
  // =========================================================================
  const addCustomExercise = (exercise) => {
    const newEx = {
      id: 'custom_' + Date.now(),
      isCustom: true,
      ...exercise
    };
    setCustomExercises((prev) => [newEx, ...prev]);
    showToast(`¡Ejercicio "${exercise.name}" creado con éxito! ✨`);
    return newEx;
  };

  // Get all exercises (Base + Custom)
  const getAllExercises = () => {
    const all = [];
    Object.values(MUSCLE_DATABASE).forEach((grp) => {
      grp.exercises.forEach((ex) => {
        all.push({ ...ex, muscleGroup: grp.name });
      });
    });
    customExercises.forEach((c) => {
      all.push({ ...c, muscleGroup: c.primaryMuscle });
    });
    return all;
  };

  // =========================================================================
  // ACTIONS: ROUTINES CRUD
  // =========================================================================
  const createRoutine = (name, description = '') => {
    const id = generateUUID();
    const newRoutine = {
      id,
      name: name.trim(),
      description: description.trim(),
      color: '#A5C978',
      exercises: []
    };
    setRoutines((prev) => ({ ...prev, [id]: newRoutine }));
    showToast(`Rutina "${name}" creada`);
    syncRoutineToSupabase(newRoutine, currentUser?.id);
    return id;
  };

  const updateRoutine = (routineId, updatedData) => {
    setRoutines((prev) => {
      const updatedRoutine = { ...prev[routineId], ...updatedData };
      syncRoutineToSupabase(updatedRoutine, currentUser?.id);
      return {
        ...prev,
        [routineId]: updatedRoutine
      };
    });
    showToast('Rutina actualizada');
  };

  const duplicateRoutine = (routineId) => {
    const original = routines[routineId];
    if (!original) return;
    const newId = generateUUID();
    const duplicated = {
      ...original,
      id: newId,
      name: `${original.name} (Copia)`,
      exercises: original.exercises.map((e) => ({
        ...e,
        id: generateUUID(),
        sets: e.sets.map((s) => ({ ...s, done: false }))
      }))
    };
    setRoutines((prev) => ({ ...prev, [newId]: duplicated }));
    showToast(`Rutina duplicada`);
    syncRoutineToSupabase(duplicated, currentUser?.id);
  };

  const deleteRoutine = (routineId) => {
    setRoutines((prev) => {
      const copy = { ...prev };
      delete copy[routineId];
      return copy;
    });
    // Remove from calendar
    setCalendarSchedules((prev) => prev.filter((s) => s.routineId !== routineId));
    showToast('Rutina eliminada');
    deleteRoutineFromSupabase(routineId);
  };

  const addExerciseToRoutine = (routineId, exerciseData) => {
    setRoutines((prev) => {
      const routine = prev[routineId];
      if (!routine) return prev;
      if (routine.exercises.some((e) => e.name === exerciseData.name)) {
        showToast(`Ya está en "${routine.name}"`);
        return prev;
      }

      const exercise = {
        id: generateUUID(),
        name: exerciseData.name,
        muscle: exerciseData.muscleGroup || exerciseData.primaryMuscle || 'General',
        targetSets: 3,
        targetReps: 10,
        lastPerformance: null,
        sets: [
          { reps: 10, weight: 20, done: false },
          { reps: 10, weight: 20, done: false },
          { reps: 10, weight: 20, done: false }
        ]
      };

      const updatedRoutine = {
        ...routine,
        exercises: [...routine.exercises, exercise]
      };

      const updated = {
        ...prev,
        [routineId]: updatedRoutine
      };

      showToast(`¡Agregado a ${routine.name}!`);
      syncRoutineToSupabase(updatedRoutine, currentUser?.id);
      return updated;
    });
  };

  const removeExerciseFromRoutine = (routineId, exerciseId) => {
    setRoutines((prev) => {
      const routine = prev[routineId];
      if (!routine) return prev;
      const updatedRoutine = {
        ...routine,
        exercises: routine.exercises.filter((e) => e.id !== exerciseId)
      };
      syncRoutineToSupabase(updatedRoutine, currentUser?.id);
      return {
        ...prev,
        [routineId]: updatedRoutine
      };
    });
    showToast('Ejercicio removido de la rutina');
  };

  // =========================================================================
  // ACTIONS: LIVE WORKOUT TRACKING
  // =========================================================================
  const startWorkout = (routineId) => {
    const routine = routines[routineId];
    if (!routine) return;

    // Clone routine exercises with clean set done states
    const activeSession = {
      id: 'session_' + Date.now(),
      routineId,
      routineName: routine.name,
      startedAt: new Date().toISOString(),
      exercises: routine.exercises.map((ex) => ({
        ...ex,
        sets: ex.sets.map((s) => ({ ...s, done: false }))
      }))
    };

    setActiveWorkout(activeSession);
    setCurrentModule('routines');
    showToast(`¡A entrenar ${routine.name}! 💪`);
  };

  const updateWorkoutSet = (exerciseId, setIdx, field, val) => {
    if (!activeWorkout) return;
    const num = parseFloat(val) || 0;

    setActiveWorkout((prev) => {
      const updated = { ...prev };
      const ex = updated.exercises.find((e) => e.id === exerciseId);
      if (!ex || !ex.sets[setIdx]) return prev;

      ex.sets[setIdx][field] = num;

      // PR detection!
      if (field === 'weight') {
        const prevRecord = personalRecords[ex.name]?.weight || 0;
        if (num > prevRecord && num > 0) {
          setPersonalRecords((records) => ({
            ...records,
            [ex.name]: {
              weight: num,
              reps: ex.sets[setIdx].reps || 1,
              date: new Date().toISOString().split('T')[0]
            }
          }));
          confetti({ particleCount: 75, spread: 65, origin: { y: 0.6 } });
          showToast(`¡Nuevo récord en ${ex.name}: ${num} kg! 🏆`);
        }
      }

      return updated;
    });
  };

  const toggleWorkoutSetDone = (exerciseId, setIdx) => {
    if (!activeWorkout) return;

    setActiveWorkout((prev) => {
      const updated = { ...prev };
      const ex = updated.exercises.find((e) => e.id === exerciseId);
      if (!ex || !ex.sets[setIdx]) return prev;

      const nextDone = !ex.sets[setIdx].done;
      ex.sets[setIdx].done = nextDone;

      if (nextDone) {
        // Auto-start rest timer
        setTimerSeconds(timerPreset);
        setIsTimerRunning(true);
        playBeep(600, 150);
        showToast('¡Serie completada! Descanso iniciado ⏱️');
      }

      return updated;
    });
  };

  const addWorkoutSet = (exerciseId) => {
    if (!activeWorkout) return;

    setActiveWorkout((prev) => {
      const updated = { ...prev };
      const ex = updated.exercises.find((e) => e.id === exerciseId);
      if (!ex) return prev;

      const last = ex.sets[ex.sets.length - 1] || { reps: 10, weight: 20 };
      ex.sets.push({ reps: last.reps, weight: last.weight, done: false });
      return updated;
    });
  };

  const finishActiveWorkout = () => {
    if (!activeWorkout) return;

    let totalVolume = 0;
    let totalCompletedSets = 0;

    activeWorkout.exercises.forEach((ex) => {
      ex.sets.forEach((s) => {
        if (s.done) {
          totalVolume += s.weight * s.reps;
          totalCompletedSets++;
        }
      });
    });

    const completedSession = {
      ...activeWorkout,
      endedAt: new Date().toISOString(),
      totalVolume,
      totalCompletedSets
    };

    // Update routine with last performance snapshot
    setRoutines((prev) => {
      const r = prev[activeWorkout.routineId];
      if (!r) return prev;
      return {
        ...prev,
        [activeWorkout.routineId]: {
          ...r,
          exercises: r.exercises.map((rEx) => {
            const activeEx = activeWorkout.exercises.find((e) => e.id === rEx.id);
            if (!activeEx) return rEx;
            const completedSets = activeEx.sets.filter((s) => s.done);
            if (completedSets.length === 0) return rEx;
            const maxW = Math.max(...completedSets.map((s) => s.weight));
            const avgR = completedSets[0]?.reps || 10;
            return {
              ...rEx,
              lastPerformance: `${completedSets.length}x${avgR} @ ${maxW}kg`
            };
          })
        }
      };
    });

    // Save in workout history
    setWorkoutHistory((prev) => [completedSession, ...prev]);

    // Mark current day in calendar as completed if scheduled
    const todayStr = new Date().toISOString().split('T')[0];
    setCalendarSchedules((prev) => {
      const existing = prev.find(
        (s) => s.date === todayStr && s.routineId === activeWorkout.routineId
      );
      if (existing) {
        return prev.map((s) => (s.id === existing.id ? { ...s, status: 'completed' } : s));
      }
      return [
        ...prev,
        {
          id: 'sched_' + Date.now(),
          routineId: activeWorkout.routineId,
          routineName: activeWorkout.routineName,
          date: todayStr,
          status: 'completed'
        }
      ];
    });

    setActiveWorkout(null);
    confetti({ particleCount: 110, spread: 80, origin: { y: 0.6 } });
    showToast('¡Lo lograste! Guardamos esta sesión 🎉');
  };

  const cancelActiveWorkout = () => {
    setActiveWorkout(null);
    showToast('Sesión cancelada');
  };

  // =========================================================================
  // ACTIONS: CALENDAR PLANNING (DRAG & DROP)
  // =========================================================================
  const scheduleRoutineOnDate = (routineId, dateStr) => {
    const routine = routines[routineId];
    if (!routine) return;

    // Remove if routine already scheduled on that same date
    setCalendarSchedules((prev) => {
      const filtered = prev.filter(
        (s) => !(s.date === dateStr && s.routineId === routineId)
      );
      return [
        ...filtered,
        {
          id: 'sched_' + Date.now(),
          routineId,
          routineName: routine.name,
          date: dateStr,
          status: 'planned'
        }
      ];
    });

    showToast(`"${routine.name}" agendada para el ${dateStr} 📅`);
  };

  const moveScheduledRoutine = (scheduleId, newDateStr) => {
    setCalendarSchedules((prev) =>
      prev.map((s) => (s.id === scheduleId ? { ...s, date: newDateStr } : s))
    );
    showToast(`Entrenamiento reprogramado al ${newDateStr} 🗓️`);
  };

  const removeScheduledRoutine = (scheduleId) => {
    setCalendarSchedules((prev) => prev.filter((s) => s.id !== scheduleId));
    showToast('Entrenamiento quitado del calendario');
  };

  // =========================================================================
  // ACTIONS: BODY METRICS
  // =========================================================================
  const addBodyMetric = async (metricData) => {
    const entry = {
      id: generateUUID(),
      ...metricData
    };
    setBodyMetrics((prev) => [entry, ...prev]);
    showToast('¡Marcas corporales guardadas! 🎉');
    await syncBodyMetricToSupabase(entry, currentUser?.id);
  };

  return (
    <FitmateContext.Provider
      value={{
        // User & Auth
        currentUser,
        setCurrentUser,
        // Nav
        currentModule,
        setCurrentModule,
        isDrawerOpen,
        setIsDrawerOpen,
        // Explorer
        selectedMuscle,
        setSelectedMuscle,
        bodyView,
        setBodyView,
        equipmentFilter,
        setEquipmentFilter,
        customExercises,
        addCustomExercise,
        getAllExercises,
        // Routines
        routines,
        createRoutine,
        updateRoutine,
        duplicateRoutine,
        deleteRoutine,
        addExerciseToRoutine,
        removeExerciseFromRoutine,
        // Live Workout
        activeWorkout,
        startWorkout,
        updateWorkoutSet,
        toggleWorkoutSetDone,
        addWorkoutSet,
        finishActiveWorkout,
        cancelActiveWorkout,
        workoutHistory,
        personalRecords,
        // Calendar
        calendarSchedules,
        scheduleRoutineOnDate,
        moveScheduledRoutine,
        removeScheduledRoutine,
        // Body
        bodyMetrics,
        addBodyMetric,
        monthlyKmGoal,
        setMonthlyKmGoal,
        // Timer
        timerSeconds,
        timerPreset,
        isTimerRunning,
        isTimerDrawerOpen,
        setIsTimerDrawerOpen,
        toggleTimer,
        resetTimer,
        changeTimerPreset,
        // Modals & Toast
        isCreateExerciseModalOpen,
        setIsCreateExerciseModalOpen,
        toast,
        showToast,
        // In-app Confirm Modal
        confirmModal,
        showConfirm,
        closeConfirm,
      }}
    >
      {children}
    </FitmateContext.Provider>
  );
};

export const useFitmate = () => useContext(FitmateContext);
export const useGot = useFitmate;
export const GotProvider = FitmateProvider;
export const GotContext = FitmateContext;
