import React from 'react';
import { useFitmate } from '../../context/FitmateContext';
import { supabaseSignOut, getSupabaseConfig } from '../../lib/supabase';

export const Drawer = () => {
  const {
    isDrawerOpen,
    setIsDrawerOpen,
    currentModule,
    setCurrentModule,
    currentUser,
    setCurrentUser,
    setIsSyncModalOpen,
    setIsTimerDrawerOpen,
    isTimerDrawerOpen,
    showToast,
    workoutHistory,
    bodyMetrics,
    personalRecords
  } = useFitmate();

  if (!isDrawerOpen) return null;

  const config = getSupabaseConfig();
  const isCloudConnected = Boolean(config.url && config.key);
  const initial = (currentUser?.name || currentUser?.email || 'A').charAt(0).toUpperCase();

  const navItems = [
    {
      id: 'explore',
      label: 'Explorador Anatómico',
      subtitle: 'Mapa muscular MuscleWiki & ejercicios',
      icon: 'fa-solid fa-person'
    },
    {
      id: 'routines',
      label: 'Gestor de Rutinas & Live',
      subtitle: 'Armá rutinas y registrá series en vivo',
      icon: 'fa-solid fa-dumbbell'
    },
    {
      id: 'calendar',
      label: 'Calendario de Planificación',
      subtitle: 'Arrastrá y soltá tus entrenamientos',
      icon: 'fa-regular fa-calendar-days'
    },
    {
      id: 'body',
      label: 'Marcas Corporales & Running',
      subtitle: 'Peso, brazos I/D, km y satisfacción',
      icon: 'fa-solid fa-ruler-combined'
    },
    {
      id: 'dashboard',
      label: 'Dashboard de Progreso',
      subtitle: 'Mirá cómo venís: métricas y gráficos',
      icon: 'fa-solid fa-chart-line'
    }
  ];

  const handleNavigate = (id) => {
    setCurrentModule(id);
    setIsDrawerOpen(false);
  };

  const handleLogout = async () => {
    await supabaseSignOut();
    setCurrentUser(null);
    setIsDrawerOpen(false);
    showToast('Sesión cerrada');
  };

  const prsCount = Object.keys(personalRecords).length;

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-carbon/80 backdrop-blur-sm transition-opacity"
        onClick={() => setIsDrawerOpen(false)}
      ></div>

      {/* Drawer Container */}
      <div className="relative w-80 max-w-[85vw] bg-carbonCard border-r border-forest h-full flex flex-col justify-between shadow-2xl z-10 p-5 overflow-y-auto">
        <div className="space-y-6">
          {/* Header of Drawer */}
          <div className="flex items-center justify-between pb-3 border-b border-forest/60">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl overflow-hidden bg-black flex items-center justify-center shrink-0 shadow p-0.5">
                <img
                  src={`${import.meta.env.BASE_URL}assets/got-logo.png`}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = `${import.meta.env.BASE_URL}GOT logo.png`;
                  }}
                  alt="GOT Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <h2 className="font-heading font-extrabold text-base text-cream tracking-tight leading-none">
                  GOT
                </h2>
                <p className="text-[10px] text-moss font-semibold mt-0.5">Your Gym Buddy.</p>
              </div>
            </div>

            <button
              onClick={() => setIsDrawerOpen(false)}
              className="w-8 h-8 rounded-full bg-carbon text-cream/70 hover:text-cream flex items-center justify-center transition-all"
            >
              <i className="fa-solid fa-xmark text-sm"></i>
            </button>
          </div>

          {/* User Profile Card */}
          <div className="bg-forest/50 p-3.5 rounded-2xl border border-moss/30 flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-moss text-carbon font-heading font-extrabold flex items-center justify-center text-lg shadow-md shadow-moss/20 shrink-0">
              {initial}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-heading font-bold text-sm text-cream truncate">
                {currentUser?.name || 'Atleta GOT'}
              </h4>
              <p className="text-[11px] text-moss truncate">{currentUser?.email}</p>
              <span className="inline-block mt-0.5 text-[9px] bg-carbon px-2 py-0.5 rounded-full text-cream/75 border border-forest">
                {currentUser?.isGuest
                  ? 'Modo Invitado / Local'
                  : isCloudConnected
                  ? 'Supabase Cloud Sync'
                  : 'Modo Offline'}
              </span>
            </div>
          </div>

          {/* Navigation Items (The 5 Core Modules) */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-cream/50 px-2 block mb-1">
              Módulos Principales
            </span>
            {navItems.map((item) => {
              const isActive = currentModule === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavigate(item.id)}
                  className={`w-full text-left p-3 rounded-2xl border transition-all flex items-center gap-3.5 ${
                    isActive
                      ? 'bg-moss text-carbon border-moss font-bold shadow-lg shadow-moss/20'
                      : 'bg-carbon/60 text-cream border-forest/60 hover:bg-forest/40 hover:border-moss/40'
                  }`}
                >
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      isActive ? 'bg-carbon text-moss' : 'bg-forest text-moss'
                    }`}
                  >
                    <i className={`${item.icon} text-base`}></i>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className={`text-xs font-heading font-bold leading-tight ${isActive ? 'text-carbon' : 'text-cream'}`}>
                      {item.label}
                    </p>
                    <p className={`text-[10px] truncate mt-0.5 ${isActive ? 'text-carbon/80' : 'text-cream/60'}`}>
                      {item.subtitle}
                    </p>
                  </div>
                  {isActive && <i className="fa-solid fa-chevron-right text-xs text-carbon"></i>}
                </button>
              );
            })}
          </div>

          {/* Quick Stats Summary */}
          <div className="grid grid-cols-3 gap-2 bg-carbon/70 p-3 rounded-2xl border border-forest text-center">
            <div>
              <span className="block text-xs font-heading font-extrabold text-moss">
                {prsCount}
              </span>
              <span className="text-[9px] text-cream/60 uppercase">Récords</span>
            </div>
            <div>
              <span className="block text-xs font-heading font-extrabold text-moss">
                {workoutHistory.length}
              </span>
              <span className="text-[9px] text-cream/60 uppercase">Sesiones</span>
            </div>
            <div>
              <span className="block text-xs font-heading font-extrabold text-moss">
                {bodyMetrics.length}
              </span>
              <span className="text-[9px] text-cream/60 uppercase">Marcas</span>
            </div>
          </div>
        </div>

        {/* Drawer Bottom Actions */}
        <div className="space-y-2 pt-4 border-t border-forest/60">
          <button
            onClick={() => {
              setIsDrawerOpen(false);
              setIsTimerDrawerOpen(!isTimerDrawerOpen);
            }}
            className="w-full bg-carbon hover:bg-forest/50 text-cream/80 text-xs font-semibold py-2 rounded-xl border border-forest flex items-center justify-center gap-2 transition-all"
          >
            <i className="fa-solid fa-stopwatch text-moss"></i>
            <span>Temporizador de Descanso</span>
          </button>

          {/* Supabase config — subtle link */}
          <button
            onClick={() => {
              setIsDrawerOpen(false);
              setIsSyncModalOpen(true);
            }}
            className="w-full text-cream/40 hover:text-moss text-[11px] py-1.5 flex items-center justify-center gap-1.5 transition-all"
          >
            <i className="fa-solid fa-database text-[10px]"></i>
            <span>Configurar Supabase</span>
          </button>

          <button
            onClick={handleLogout}
            className="w-full bg-carbon hover:bg-red-950/40 text-red-300 text-xs font-bold py-2 rounded-xl border border-red-900/40 flex items-center justify-center gap-2 transition-all"
          >
            <i className="fa-solid fa-right-from-bracket"></i>
            <span>Cerrar Sesión</span>
          </button>

          <p className="text-[10px] text-center text-cream/40 pt-1">
            GOT • Your Gym Buddy
          </p>
        </div>
      </div>
    </div>
  );
};
