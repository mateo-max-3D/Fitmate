import React, { useState } from 'react';
import { useFitmate } from '../../context/FitmateContext';
import { updateSupabaseClient, getSupabaseConfig, syncBodyMetricToSupabase } from '../../lib/supabase';

export const SyncModal = () => {
  const { isSyncModalOpen, setIsSyncModalOpen, showToast, bodyMetrics } = useFitmate();
  const config = getSupabaseConfig();

  const [url, setUrl] = useState(config.url || '');
  const [key, setKey] = useState(config.key || '');

  if (!isSyncModalOpen) return null;

  const handleSave = () => {
    const success = updateSupabaseClient(url, key);
    if (success) {
      showToast('Credenciales de Supabase guardadas ☁️');
    } else {
      showToast('Modo Local Offline activo');
    }
    setIsSyncModalOpen(false);
  };

  const handleSyncNow = async () => {
    if (!url || !key) {
      showToast('Ingresá URL y Anon Key primero');
      return;
    }
    const latest = bodyMetrics[bodyMetrics.length - 1];
    if (latest) {
      const ok = await syncBodyMetricToSupabase(latest);
      if (ok) {
        showToast('¡Datos sincronizados con Supabase! ✅');
      } else {
        showToast('Guardado localmente (sin conexión a red)');
      }
    } else {
      showToast('Sin métricas pendientes de sincronizar');
    }
  };

  const copySqlSchema = () => {
    const sql = `-- Tablas GOT v2.1 para Supabase
-- Podés encontrar el script completo con RLS y Triggers en database/schema.sql
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,
  monthly_km_goal NUMERIC(5,2) DEFAULT 30.00
);

CREATE TABLE IF NOT EXISTS public.routines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  is_active BOOLEAN DEFAULT false
);

CREATE TABLE IF NOT EXISTS public.workout_sets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exercise_name TEXT NOT NULL,
  set_number INT NOT NULL,
  reps INT NOT NULL,
  weight_kg NUMERIC(6,2) NOT NULL,
  is_pr BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS public.body_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  recorded_date DATE NOT NULL DEFAULT CURRENT_DATE,
  weight_kg NUMERIC(5,2),
  arm_left_cm NUMERIC(4,1),
  arm_right_cm NUMERIC(4,1),
  km_run_accumulated NUMERIC(5,2),
  satisfaction INT CHECK (satisfaction BETWEEN 1 AND 10),
  notes TEXT
);`;

    navigator.clipboard.writeText(sql);
    showToast('Esquema SQL copiado al portapapeles 📋');
  };

  return (
    <div className="fixed inset-0 bg-carbon/85 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-carbonCard border border-forest p-5 rounded-3xl w-full max-w-sm max-h-[88vh] overflow-y-auto space-y-4 shadow-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <i className="fa-solid fa-database text-moss"></i>
            <h3 className="font-heading font-extrabold text-base text-cream">
              Supabase & Modo Offline
            </h3>
          </div>
          <button
            onClick={() => setIsSyncModalOpen(false)}
            className="w-8 h-8 rounded-full bg-carbon text-cream/70 hover:text-cream flex items-center justify-center"
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        <div className="bg-forest/40 p-3 rounded-2xl border border-moss/20 text-xs text-cream/85 space-y-1">
          <p className="font-bold text-moss">
            <i className="fa-solid fa-wifi"></i> Funciona sin Wi-Fi en el gym
          </p>
          <p>
            Todos tus entrenamientos y marcas se guardan en tu teléfono de inmediato. Al conectar
            Supabase, tus datos se respaldan en la nube.
          </p>
        </div>

        <div className="space-y-2.5">
          <div>
            <label className="block text-[11px] font-semibold text-cream/80 mb-1">
              SUPABASE_URL
            </label>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://xyz.supabase.co"
              className="w-full bg-carbon border border-forest rounded-xl px-3 py-2 text-xs text-cream focus:outline-none focus:border-moss"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-cream/80 mb-1">
              SUPABASE_ANON_KEY
            </label>
            <input
              type="password"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="eyJhbGciOiJIUzI1NiIsInR5..."
              className="w-full bg-carbon border border-forest rounded-xl px-3 py-2 text-xs text-cream focus:outline-none focus:border-moss"
            />
          </div>

          <div className="flex gap-2 pt-1">
            <button
              onClick={handleSave}
              className="flex-1 bg-moss text-carbon font-heading font-bold text-xs py-2.5 rounded-xl shadow hover:bg-moss/90 transition-all"
            >
              Guardar Credenciales
            </button>
            <button
              onClick={handleSyncNow}
              className="bg-forest text-moss border border-moss/30 font-bold text-xs px-3 py-2.5 rounded-xl hover:bg-forestLight transition-all"
              title="Sincronizar ahora"
            >
              <i className="fa-solid fa-cloud-arrow-up"></i>
            </button>
          </div>
        </div>

        {/* Copyable SQL Schema */}
        <div className="space-y-1.5 pt-2 border-t border-forest">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-moss">Esquema SQL para Supabase</span>
            <button
              onClick={copySqlSchema}
              className="text-[11px] bg-carbon hover:bg-forest px-2.5 py-1 rounded-lg text-cream font-semibold border border-forest flex items-center gap-1 transition-all"
            >
              <i className="fa-regular fa-copy"></i> Copiar SQL
            </button>
          </div>
          <pre className="bg-carbon p-2.5 rounded-xl border border-forest text-[10px] text-cream/80 overflow-x-auto leading-relaxed font-mono">
{`-- Tablas GOT v2.1
-- Archivo database/schema.sql contiene el script completo con Triggers y RLS
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT NOT NULL UNIQUE,
  monthly_km_goal NUMERIC(5,2) DEFAULT 30.00
);

CREATE TABLE body_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  weight_kg NUMERIC(5,2),
  arm_left_cm NUMERIC(4,1),
  arm_right_cm NUMERIC(4,1),
  km_run_accumulated NUMERIC(5,2),
  satisfaction INT CHECK (satisfaction BETWEEN 1 AND 10)
);`}
          </pre>
        </div>
      </div>
    </div>
  );
};
