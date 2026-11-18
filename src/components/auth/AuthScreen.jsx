import React, { useState } from 'react';
import { useFitmate } from '../../context/FitmateContext';
import { supabaseSignIn, supabaseSignUp } from '../../lib/supabase';

export const AuthScreen = () => {
  const { setCurrentUser, showToast } = useFitmate();
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'register'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (authMode === 'login') {
        const { data, error } = await supabaseSignIn(email, password);
        if (error) throw error;
        setCurrentUser({
          id: data.user.id,
          email: data.user.email,
          name: data.user.user_metadata?.full_name || email.split('@')[0],
          isGuest: false
        });
        showToast(`¡Bienvenido de vuelta, ${data.user.user_metadata?.full_name || 'Atleta'}!`);
      } else {
        const { data, error } = await supabaseSignUp(email, password, fullName);
        if (error) throw error;
        setCurrentUser({
          id: data.user?.id || 'u_' + Date.now(),
          email,
          name: fullName || email.split('@')[0],
          isGuest: false
        });
        showToast('¡Cuenta creada con éxito! 🎉');
      }
    } catch (err) {
      console.warn('Supabase auth fallback to local session', err);
      setCurrentUser({
        id: 'local_' + Date.now(),
        email,
        name: fullName || email.split('@')[0],
        isGuest: false
      });
      showToast(`¡Sesión iniciada! Hola ${fullName || email.split('@')[0]}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuestLogin = () => {
    setCurrentUser({
      id: 'guest_' + Date.now(),
      email: 'invitado@got.app',
      name: 'Atleta GOT',
      isGuest: true
    });
    showToast('Entrando en Modo Offline / Invitado 🚀');
  };

  return (
    <div className="w-full max-w-md bg-carbon min-h-screen flex flex-col justify-between p-6 relative border-x border-forest/40 z-50">
      {/* Background Ambient Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-72 h-72 bg-moss/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="relative z-10 space-y-6 pt-6">
        {/* Brand & Logo Section */}
        <div className="flex flex-col items-center text-center space-y-3">
          <div className="relative group">
            <div className="w-44 h-44 rounded-3xl overflow-hidden bg-forest/40 flex items-center justify-center p-2 transition-transform duration-300 hover:scale-105">
              <img
                src="/assets/got-logo.png"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/GOT logo.png';
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
          <div className="relative flex items-center justify-center my-3">
            <div className="border-t border-forest w-full"></div>
            <span className="bg-carbonCard px-3 text-[10px] font-bold uppercase tracking-wider text-cream/50 absolute">
              o ingresá sin registro
            </span>
          </div>

          {/* Guest Button */}
          <button
            type="button"
            onClick={handleGuestLogin}
            className="w-full bg-forest/80 hover:bg-forest text-cream font-heading font-bold py-2.5 rounded-2xl border border-moss/30 active:scale-[0.99] transition-all flex items-center justify-center gap-2 text-xs"
          >
            <i className="fa-solid fa-bolt text-moss"></i>
            <span>Entrar como Invitado (Modo Offline)</span>
          </button>
        </div>
      </div>

      <div className="text-center pt-6 pb-2 text-[11px] text-cream/50">
        <p>GOT funciona sin conexión a internet y se sincroniza con Supabase en la nube.</p>
      </div>
    </div>
  );
};
