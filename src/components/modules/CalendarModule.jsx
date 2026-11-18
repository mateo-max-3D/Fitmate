import React, { useState } from 'react';
import { useFitmate } from '../../context/FitmateContext';

export const CalendarModule = () => {
  const {
    routines,
    calendarSchedules,
    scheduleRoutineOnDate,
    moveScheduledRoutine,
    removeScheduledRoutine,
    startWorkout,
    showToast
  } = useFitmate();

  const [calendarView, setCalendarView] = useState('week'); // 'week' | 'month'
  const [currentWeekOffset, setCurrentWeekOffset] = useState(0); // 0 = current week, 1 = next week, etc.
  const [draggingRoutineId, setDraggingRoutineId] = useState(null);
  const [draggingScheduleId, setDraggingScheduleId] = useState(null);

  // Helper to get week days
  const getDaysOfWeek = (offsetWeeks = 0) => {
    const today = new Date();
    const currentDayOfWeek = today.getDay(); // 0 is Sunday, 1 is Monday...
    // Normalize to Monday as first day
    const distanceToMonday = (currentDayOfWeek + 6) % 7;
    const monday = new Date(today);
    monday.setDate(today.getDate() - distanceToMonday + offsetWeeks * 7);

    const days = [];
    const dayNames = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
    const shortNames = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const isoDate = d.toISOString().split('T')[0];
      const isToday = isoDate === today.toISOString().split('T')[0];

      days.push({
        dateStr: isoDate,
        dayNumber: d.getDate(),
        monthName: d.toLocaleString('es-ES', { month: 'short' }),
        fullDayName: dayNames[i],
        shortDayName: shortNames[i],
        isToday
      });
    }
    return days;
  };

  // Helper to get month days
  const getDaysOfMonth = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const numDays = new Date(year, month + 1, 0).getDate();

    const days = [];
    for (let i = 1; i <= numDays; i++) {
      const d = new Date(year, month, i);
      const isoDate = d.toISOString().split('T')[0];
      const isToday = isoDate === today.toISOString().split('T')[0];
      days.push({
        dateStr: isoDate,
        dayNumber: i,
        monthName: d.toLocaleString('es-ES', { month: 'short' }),
        shortDayName: d.toLocaleString('es-ES', { weekday: 'short' }),
        isToday
      });
    }
    return days;
  };

  const weekDays = getDaysOfWeek(currentWeekOffset);
  const monthDays = getDaysOfMonth();

  // HTML5 Drag Handlers
  const handleDragStartRoutine = (e, routineId) => {
    e.dataTransfer.setData('text/plain', JSON.stringify({ type: 'routine', routineId }));
    setDraggingRoutineId(routineId);
  };

  const handleDragStartSchedule = (e, scheduleId) => {
    e.dataTransfer.setData('text/plain', JSON.stringify({ type: 'schedule', scheduleId }));
    setDraggingScheduleId(scheduleId);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, targetDateStr) => {
    e.preventDefault();
    try {
      const dataStr = e.dataTransfer.getData('text/plain');
      if (!dataStr) return;
      const data = JSON.parse(dataStr);

      if (data.type === 'routine' && data.routineId) {
        scheduleRoutineOnDate(data.routineId, targetDateStr);
      } else if (data.type === 'schedule' && data.scheduleId) {
        moveScheduledRoutine(data.scheduleId, targetDateStr);
      }
    } catch (err) {
      console.error('Error on drop:', err);
    } finally {
      setDraggingRoutineId(null);
      setDraggingScheduleId(null);
    }
  };

  return (
    <section className="space-y-4 animate-fadeIn">
      {/* Header & View Switch */}
      <div className="bg-forest/60 p-4 rounded-3xl border border-moss/30 flex items-center justify-between">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-moss">
            Módulo 3 • Planificación
          </span>
          <h2 className="text-lg font-heading font-extrabold text-cream mt-0.5">
            Calendario de Rutinas
          </h2>
          <p className="text-xs text-cream/70 mt-0.5">
            Arrastrá tus rutinas al día que prefieras para organizar tu semana.
          </p>
        </div>

        {/* View Switch */}
        <div className="flex items-center bg-carbon p-1 rounded-xl border border-forest">
          <button
            onClick={() => setCalendarView('week')}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              calendarView === 'week'
                ? 'bg-moss text-carbon shadow'
                : 'text-cream/70 hover:text-cream'
            }`}
          >
            Semana
          </button>
          <button
            onClick={() => setCalendarView('month')}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              calendarView === 'month'
                ? 'bg-moss text-carbon shadow'
                : 'text-cream/70 hover:text-cream'
            }`}
          >
            Mes
          </button>
        </div>
      </div>

      {/* Routine Tray (Bandeja superior de rutinas para arrastrar o tocar) */}
      <div className="bg-carbonCard p-3.5 rounded-3xl border border-forest space-y-2 shadow-inner">
        <div className="flex items-center justify-between px-1">
          <span className="text-[11px] font-bold text-cream/80 flex items-center gap-1.5">
            <i className="fa-solid fa-hand-pointer text-moss text-xs"></i>
            <span>Bandeja de Rutinas (Arrastrá a un día):</span>
          </span>
          <span className="text-[10px] text-moss font-semibold">Táctil & Arrastre</span>
        </div>

        <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
          {Object.values(routines).length === 0 ? (
            <p className="text-xs text-cream/50 py-2 px-1">
              No tenés rutinas creadas. Creá una en el Módulo 2.
            </p>
          ) : (
            Object.values(routines).map((routine) => (
              <div
                key={routine.id}
                draggable="true"
                onDragStart={(e) => handleDragStartRoutine(e, routine.id)}
                className="bg-forest/80 hover:bg-forest text-cream border border-moss/30 p-2.5 rounded-2xl cursor-grab active:cursor-grabbing flex items-center gap-2 shrink-0 select-none shadow-md hover:scale-[1.02] transition-all"
              >
                <i className="fa-solid fa-grip-vertical text-moss/70 text-xs"></i>
                <div className="truncate max-w-[140px]">
                  <p className="text-xs font-heading font-extrabold truncate leading-tight">
                    {routine.name}
                  </p>
                  <p className="text-[10px] text-cream/60">
                    {routine.exercises.length} ejer.
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Week Navigator (if week view) */}
      {calendarView === 'week' && (
        <div className="flex items-center justify-between px-1">
          <button
            onClick={() => setCurrentWeekOffset((prev) => prev - 1)}
            className="text-xs bg-carbonCard hover:bg-forest px-3 py-1.5 rounded-xl border border-forest text-cream/80 flex items-center gap-1 transition-all"
          >
            <i className="fa-solid fa-chevron-left text-[10px]"></i>
            <span>Anterior</span>
          </button>

          <span className="text-xs font-heading font-extrabold text-moss">
            {currentWeekOffset === 0
              ? 'Esta semana'
              : currentWeekOffset === 1
              ? 'Próxima semana'
              : currentWeekOffset === -1
              ? 'Semana pasada'
              : `Semana ${currentWeekOffset > 0 ? '+' : ''}${currentWeekOffset}`}
          </span>

          <button
            onClick={() => setCurrentWeekOffset((prev) => prev + 1)}
            className="text-xs bg-carbonCard hover:bg-forest px-3 py-1.5 rounded-xl border border-forest text-cream/80 flex items-center gap-1 transition-all"
          >
            <span>Siguiente</span>
            <i className="fa-solid fa-chevron-right text-[10px]"></i>
          </button>
        </div>
      )}

      {/* WEEK VIEW GRID */}
      {calendarView === 'week' && (
        <div className="space-y-3">
          {weekDays.map((day) => {
            const scheduledForThisDay = calendarSchedules.filter(
              (s) => s.date === day.dateStr
            );

            return (
              <div
                key={day.dateStr}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, day.dateStr)}
                className={`p-3.5 rounded-3xl border transition-all ${
                  day.isToday
                    ? 'bg-carbonCard border-moss shadow-md'
                    : 'bg-carbonCard/80 border-forest'
                }`}
              >
                {/* Day Header */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-heading font-extrabold px-2.5 py-0.5 rounded-full ${
                        day.isToday
                          ? 'bg-moss text-carbon'
                          : 'bg-carbon text-cream/80 border border-forest'
                      }`}
                    >
                      {day.shortDayName} {day.dayNumber} {day.monthName}
                    </span>
                    {day.isToday && (
                      <span className="text-[10px] text-moss font-bold uppercase tracking-wider">
                        Hoy
                      </span>
                    )}
                  </div>

                  <span className="text-[10px] text-cream/40">
                    {scheduledForThisDay.length === 0
                      ? 'Descanso'
                      : `${scheduledForThisDay.length} rutina(s)`}
                  </span>
                </div>

                {/* Scheduled Routines Area (Dropzone) */}
                <div className="space-y-2 min-h-[46px] flex flex-col justify-center">
                  {scheduledForThisDay.length === 0 ? (
                    <div className="border border-dashed border-forest/70 rounded-2xl py-2 px-3 text-center text-[11px] text-cream/40">
                      Arrastrá una rutina aquí o dejalo como día de descanso
                    </div>
                  ) : (
                    scheduledForThisDay.map((sch) => {
                      const isCompleted = sch.status === 'completed';
                      return (
                        <div
                          key={sch.id}
                          draggable="true"
                          onDragStart={(e) => handleDragStartSchedule(e, sch.id)}
                          className={`p-3 rounded-2xl border transition-all flex items-center justify-between cursor-grab active:cursor-grabbing ${
                            isCompleted
                              ? 'bg-forest/60 border-moss/50 text-cream'
                              : 'bg-carbon border-moss/30 text-cream'
                          }`}
                        >
                          <div
                            onClick={() => startWorkout(sch.routineId)}
                            className="flex items-center gap-2.5 min-w-0 cursor-pointer flex-1"
                            title="Tocar para entrenar esta rutina"
                          >
                            <span
                              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs shrink-0 ${
                                isCompleted
                                  ? 'bg-moss text-carbon font-extrabold'
                                  : 'bg-carbon text-moss border border-moss/40'
                              }`}
                            >
                              <i
                                className={`fa-solid ${
                                  isCompleted ? 'fa-check' : 'fa-dumbbell'
                                }`}
                              ></i>
                            </span>

                            <div className="truncate">
                              <p className="font-heading font-extrabold text-xs truncate">
                                {sch.routineName}
                              </p>
                              <span
                                className={`text-[10px] font-bold ${
                                  isCompleted ? 'text-moss' : 'text-cream/60'
                                }`}
                              >
                                {isCompleted ? 'Completado hoy' : 'Planificado (Tocá para entrenar)'}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            {!isCompleted && (
                              <button
                                onClick={() => startWorkout(sch.routineId)}
                                className="bg-moss/20 hover:bg-moss text-moss hover:text-carbon px-2.5 py-1 rounded-xl text-[10px] font-extrabold border border-moss/30 transition-all"
                              >
                                Entrenar
                              </button>
                            )}
                            <button
                              onClick={() => removeScheduledRoutine(sch.id)}
                              className="w-7 h-7 rounded-lg bg-carbon/50 hover:bg-red-950/40 text-cream/40 hover:text-red-300 flex items-center justify-center text-xs transition-all"
                              title="Quitar del calendario"
                            >
                              <i className="fa-solid fa-xmark"></i>
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MONTH VIEW GRID */}
      {calendarView === 'month' && (
        <div className="bg-carbonCard p-4 rounded-3xl border border-forest space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-forest/60">
            <span className="font-heading font-bold text-sm text-cream">
              Vista Mensual ({new Date().toLocaleString('es-ES', { month: 'long' })})
            </span>
            <span className="text-[10px] text-moss font-semibold">Tocar día para soltar</span>
          </div>

          <div className="grid grid-cols-7 gap-1.5 text-center">
            {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((d, i) => (
              <span key={i} className="text-[10px] font-bold text-cream/50">
                {d}
              </span>
            ))}

            {monthDays.map((day) => {
              const scheduled = calendarSchedules.filter((s) => s.date === day.dateStr);
              const hasCompleted = scheduled.some((s) => s.status === 'completed');
              const hasPlanned = scheduled.some((s) => s.status === 'planned');

              return (
                <div
                  key={day.dateStr}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, day.dateStr)}
                  className={`p-1.5 min-h-[52px] rounded-xl border flex flex-col justify-between items-center transition-all ${
                    day.isToday
                      ? 'border-moss bg-moss/10'
                      : 'border-forest/50 bg-carbon/60'
                  }`}
                >
                  <span
                    className={`text-[10px] font-extrabold ${
                      day.isToday ? 'text-moss' : 'text-cream/80'
                    }`}
                  >
                    {day.dayNumber}
                  </span>

                  <div className="flex flex-col gap-0.5 w-full">
                    {hasCompleted && (
                      <span className="w-full h-1.5 rounded-full bg-moss" title="Entrenamiento completado"></span>
                    )}
                    {hasPlanned && !hasCompleted && (
                      <span className="w-full h-1.5 rounded-full bg-forestLight border border-moss/40" title="Planificado"></span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
};
