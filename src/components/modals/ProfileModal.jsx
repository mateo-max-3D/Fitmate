import React from 'react';
import { useFitmate } from '../../context/FitmateContext';
import { supabaseSignOut, getSupabaseConfig } from '../../lib/supabase';

export const ProfileModal = () => {
  const {
    currentUser,
    setCurrentUser,
    isProfileModalOpen,
    setIsProfileModalOpen,
    setIsSyncModalOpen,
    bodyMetrics,
    personalRecords,
    showToast
  } = useFitmate();

  if (!isProfileModalOpen) return null;

  const config = getSupabaseConfig();
  const latestMetric = bodyMetrics[bodyMetrics.length - 1];

  const handleLogout = async () => {
    await supabaseSignOut();
    setCurrentUser(null);
    setIsProfileModalOpen(false);
    showToast('Sesión cerrada');
  };

  const initial = (currentUser?.name || currentUser?.email || 'A').charAt(0).toUpperCase();
  const prsCount = Object.keys(personalRecords).length;

  return (
    <div className="fixed inset-0 bg-carbon/85 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-carbonCard border border-forest p-5 rounded-3xl w-full max-w-sm space-y-4 shadow-2xl">
        <div className="flex items-center justify-between">
          <h3 className="font-heading font-extrabold text-base text-cream">Mi Perfil GOT</h3>
          <button
            onClick={() => setIsProfileModalOpen(false)}
            className="w-8 h-8 rounded-full bg-carbon text-cream/70 hover:text-cream flex items-center justify-center"
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        {/* Profile Card */}
        <div className="bg-forest/40 p-4 rounded-2xl border border-moss/30 flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-moss text-carbon flex items-center justify-center text-xl font-extrabold font-heading shadow-md shadow-moss/20">
            {initial}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-heading font-bold text-sm text-cream truncate">
              {currentUser?.name || 'Atleta GOT'}
            </h4>
            <p className="text-[11px] text-moss truncate">{currentUser?.email || 'invitado@got.app'}</p>
            <span className="inline-block mt-0.5 text-[9px] bg-carbon px-2 py-0.5 rounded-full text-cream/75 border border-forest">
              {currentUser?.isGuest ? 'Modo Invitado / Local' : (config.url ? 'Supabase Cloud Sync' : 'Cuenta Local')}
            </span>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="bg-carbon p-2.5 rounded-xl border border-forest">
            <span className="block text-xs font-heading font-extrabold text-moss">{prsCount}</span>
            <span className="text-[10px] text-cream/60">Récords</span>
          </div>
          <div className="bg-carbon p-2.5 rounded-xl border border-forest">
            <span className="block text-xs font-heading font-extrabold text-moss">{latestMetric?.km || 0}</span>
            <span className="text-[10px] text-cream/60">Km Mes</span>
          </div>
          <div className="bg-carbon p-2.5 rounded-xl border border-forest">
            <span className="block text-xs font-heading font-extrabold text-moss">{bodyMetrics.length}</span>
            <span className="text-[10px] text-cream/60">Controles</span>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-2 pt-2 border-t border-forest/60">
          <button
            onClick={() => {
              setIsProfileModalOpen(false);
              setIsSyncModalOpen(true);
            }}
            className="w-full bg-forest hover:bg-forestLight text-cream text-xs font-bold py-2.5 rounded-xl border border-moss/30 flex items-center justify-center gap-2 transition-all"
          >
            <i className="fa-solid fa-cloud text-moss"></i>
            <span>Configurar Supabase Cloud</span>
          </button>
          <button
            onClick={handleLogout}
            className="w-full bg-carbon hover:bg-red-950/40 text-red-300 text-xs font-bold py-2.5 rounded-xl border border-red-900/40 flex items-center justify-center gap-2 transition-all"
          >
            <i className="fa-solid fa-right-from-bracket"></i>
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </div>
    </div>
  );
};
