import React, { useState } from 'react';
import { useFitmate } from '../../context/FitmateContext';
import { supabase, supabaseSignIn, supabaseSignUp } from '../../lib/supabase';

export const AuthScreen = () => {
  const { setCurrentUser, showToast } = useFitmate();
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'register'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const [authNotice, setAuthNotice] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setAuthError('');
    setAuthNotice('');

    try {
      if (authMode === 'login') {
        const { data, error } = await supabaseSignIn(email, password);
        if (error) throw error;

        let displayName = data.user.user_metadata?.full_name || email.split('@')[0];

        // Fetch or ensure profile
        if (supabase) {
          try {
            const { data: prof } = await supabase
              .from('profiles')
              .select('full_name')
              .eq('id', data.user.id)
              .maybeSingle();

            if (prof?.full_name) {
              displayName = prof.full_name;
            } else {
              await supabase.from('profiles').upsert({
                id: data.user.id,
                full_name: displayName
              });
            }
          } catch (pe) {
            console.warn('Profile read warning:', pe);
          }
        }

        setCurrentUser({
          id: data.user.id,
          email: data.user.email,
          name: displayName,
          isGuest: false
        });
        showToast(`¡Bienvenido de vuelta, ${displayName}!`);
      } else {
        const { data, error } = await supabaseSignUp(email, password, fullName);
        if (error) throw error;

        const displayName = fullName.trim() || email.split('@')[0];

        // Ensure profile is inserted into public.profiles
        if (data?.user && supabase) {
          try {
            await supabase.from('profiles').upsert({
              id: data.user.id,
              full_name: displayName
            });
          } catch (pe) {
            console.warn('Profile upsert warning:', pe);
          }
        }

        if (data?.session) {
          // Direct login (no email confirmation needed)
          setCurrentUser({
            id: data.user.id,
            email: data.user.email,
            name: displayName,
            isGuest: false
          });
          showToast('¡Cuenta creada y sincronizada con Supabase! 🎉');
        } else {
          // Email confirmation required by Supabase
          setAuthNotice('¡Cuenta registrada! Revisá tu correo para confirmar tu cuenta y luego iniciá sesión.');
          setAuthMode('login');
        }
      }
    } catch (err) {
      console.error('Supabase auth error:', err);
      let msg = err.message || 'Ocurrió un error al conectar con Supabase';
      if (msg.includes('Invalid login credentials')) {
        msg = 'Correo o contraseña incorrectos.';
      } else if (msg.includes('User already registered')) {
        msg = 'Este correo ya tiene una cuenta registrada. Probá iniciar sesión.';
      } else if (msg.includes('Password should be at least')) {
        msg = 'La contraseña debe tener al menos 6 caracteres.';
      } else if (msg.includes('Email not confirmed')) {
        msg = 'Por favor confirmá tu correo electrónico antes de ingresar.';
      }
      setAuthError(msg);
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="w-full max-w-md bg-carbon min-h-screen flex flex-col justify-between p-6 relative border-x border-forest/40 z-50">
      {/* Background Ambient Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-72 h-72 bg-moss/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="relative z-10 space-y-6 pt-6">
        {/* Brand & Logo Section */}
        <div className="flex flex-col items-center text-center space-y-3">
          <div className="relative group">
            <div className="w-44 h-44 rounded-3xl overflow-hidden bg-black flex items-center justify-center p-2 transition-transform duration-300 hover:scale-105">
              <img
                src={`${import.meta.env.BASE_URL}assets/got-logo.png`}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = `${import.meta.env.BASE_URL}GOT logo.png`;
                }}
                alt="GOT Logo"
                className="w-full h-full object-contain rounded-2xl"
              />
            </div>
          </div>

          <div>
            <h1 className="font-heading font-extrabold text-3xl tracking-tight text-cream">
              GOT
            </h1>
            <p className="text-xs text-moss font-semibold tracking-wide uppercase mt-0.5">
              Your Gym Buddy.
            </p>
            <p className="text-xs text-cream/60 mt-1 max-w-xs mx-auto">
              Tu compañero inteligente para entrenar, registrar pesos y seguir tu evolución física.
            </p>
          </div>
        </div>

        {/* Auth Form Card */}
        <div className="bg-carbonCard p-5 rounded-3xl border border-forest/70 shadow-2xl space-y-4">
          {/* Tabs */}
          <div className="flex bg-carbon p-1 rounded-2xl border border-forest">
            <button
              type="button"
              onClick={() => setAuthMode('login')}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                authMode === 'login'
                  ? 'bg-moss text-carbon shadow'
                  : 'text-cream/70 hover:text-cream'
              }`}
            >
              Iniciar Sesión
            </button>
            <button
              type="button"
              onClick={() => setAuthMode('register')}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                authMode === 'register'
                  ? 'bg-moss text-carbon shadow'
                  : 'text-cream/70 hover:text-cream'
              }`}
            >
              Crear Cuenta
            </button>
          </div>

          {authError && (
            <div className="bg-red-950/60 border border-red-500/50 text-red-200 text-xs p-3 rounded-xl flex items-start gap-2">
              <i className="fa-solid fa-circle-exclamation mt-0.5 text-red-400 shrink-0"></i>
              <span>{authError}</span>
            </div>
          )}

          {authNotice && (
            <div className="bg-forest/60 border border-moss/50 text-moss text-xs p-3 rounded-xl flex items-start gap-2">
              <i className="fa-solid fa-circle-info mt-0.5 text-moss shrink-0"></i>
              <span>{authNotice}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {authMode === 'register' && (
              <div>
                <label className="block text-[11px] font-semibold text-cream/80 mb-1">
                  Nombre completo
                </label>
                <div className="relative">
                  <i className="fa-solid fa-user absolute left-3.5 top-1/2 -translate-y-1/2 text-cream/40 text-xs"></i>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Tu nombre o apodo"
                    className="w-full bg-carbon border border-forest rounded-xl pl-9 pr-3 py-2.5 text-xs text-cream placeholder-cream/40 focus:outline-none focus:border-moss"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-[11px] font-semibold text-cream/80 mb-1">
                Correo electrónico
              </label>
              <div className="relative">
                <i className="fa-solid fa-envelope absolute left-3.5 top-1/2 -translate-y-1/2 text-cream/40 text-xs"></i>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@email.com"
                  className="w-full bg-carbon border border-forest rounded-xl pl-9 pr-3 py-2.5 text-xs text-cream placeholder-cream/40 focus:outline-none focus:border-moss"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-[11px] font-semibold text-cream/80">Contraseña</label>
                <span className="text-[10px] text-cream/50">Mínimo 6 caracteres</span>
              </div>
              <div className="relative">
                <i className="fa-solid fa-lock absolute left-3.5 top-1/2 -translate-y-1/2 text-cream/40 text-xs"></i>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-carbon border border-forest rounded-xl pl-9 pr-10 py-2.5 text-xs text-cream placeholder-cream/40 focus:outline-none focus:border-moss"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-cream/50 hover:text-cream text-xs"
                >
                  <i className={`fa-solid ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] pt-1">
              <label className="flex items-center gap-1.5 cursor-pointer text-cream/70 hover:text-cream">
                <input type="checkbox" defaultChecked className="accent-moss rounded w-3.5 h-3.5" />
                <span>Recordarme</span>
              </label>
              <button
                type="button"
                onClick={() => showToast('Conectá Supabase en el menú lateral para resetear tu clave')}
                className="text-moss hover:underline"
              >
                ¿Olvidaste tu clave?
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-moss text-carbon font-heading font-extrabold py-3 rounded-2xl shadow-lg shadow-moss/20 hover:bg-moss/90 active:scale-[0.99] transition-all flex items-center justify-center gap-2 text-sm mt-2 disabled:opacity-50"
            >
              <span>{isLoading ? 'Conectando...' : authMode === 'login' ? 'Entrar a GOT' : 'Crear mi cuenta en GOT'}</span>
              <i className="fa-solid fa-arrow-right text-xs"></i>
            </button>
          </form>

          {/* Divider */}
        </div>
      </div>

      <div className="text-center pt-6 pb-2 text-[11px] text-cream/50">
        <p>GOT funciona sin conexión y sincroniza tu progreso en la nube.</p>
      </div>
    </div>
  );
};
